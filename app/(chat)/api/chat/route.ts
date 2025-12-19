// app/api/chat/route.ts

export const runtime = "nodejs";
export const maxDuration = 60;

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */

import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { unstable_cache as cache } from "next/cache";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { auth, type UserType } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import type { ChatModel } from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatLastContextById,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

/* -------------------------------------------------------------------------- */
/*                               Env Validation                               */
/* -------------------------------------------------------------------------- */

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

/* -------------------------------------------------------------------------- */
/*                            OpenAI Configuration                             */
/* -------------------------------------------------------------------------- */

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * IMPORTANT:
 * Use stable models only in streaming production routes.
 * Reasoning models should be isolated to non-streaming flows.
 */
const getOpenAIModel = (chatModel: ChatModel["id"]) => {
  switch (chatModel) {
    case "chat-model-reasoning":
    case "chat-model":
    default:
      return openai("gpt-4o");
  }
};

/* -------------------------------------------------------------------------- */
/*                            TokenLens (Optional)                             */
/* -------------------------------------------------------------------------- */

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn("TokenLens unavailable, skipping enrichment", err);
      return;
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 }
);

/* -------------------------------------------------------------------------- */
/*                         Resumable Stream Context                            */
/* -------------------------------------------------------------------------- */

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message?.includes("REDIS_URL")) {
        console.log("Resumable streams disabled (REDIS_URL missing)");
      } else {
        console.error("Stream context error:", error);
      }
    }
  }
  return globalStreamContext;
}

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    requestBody = postRequestBodySchema.parse(await request.json());
  } catch {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    } = requestBody;

    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      messagesFromDb = await getMessagesByChatId({ id });
    } else {
      const title = await generateTitleFromUserMessage({ message });
      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    }

    const uiMessages = [...convertToUIMessages(messagesFromDb), message];
    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    let finalMergedUsage: AppUsage | undefined;

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const result = streamText({
          model: getOpenAIModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_transform: smoothStream({ chunking: "word" }),
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream: writer }),
            updateDocument: updateDocument({ session, dataStream: writer }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream: writer,
            }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "chat-stream",
          },
          onFinish: async ({ usage }) => {
            try {
              const providers = await getTokenlensCatalog();
              if (!providers) {
                finalMergedUsage = usage;
              } else {
                const modelId =
                  getOpenAIModel(selectedChatModel).modelId ?? "gpt-4o";
                const summary = getUsage({ modelId, usage, providers });
                finalMergedUsage = { ...usage, ...summary, modelId };
              }

              writer.write({
                type: "data-usage",
                data: finalMergedUsage,
              });
            } catch (err) {
              console.warn("Usage enrichment failed", err);
            }
          },
        });

        result.consumeStream();
        writer.merge(result.toUIMessageStream({ sendReasoning: true }));
      },

      generateId: generateUUID,

      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((m) => ({
            id: m.id,
            role: m.role,
            parts: m.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });

        if (finalMergedUsage) {
          await updateChatLastContextById({
            chatId: id,
            context: finalMergedUsage,
          });
        }
      },

      onError: () => "Oops, something went wrong.",
    });

    return new Response(
      stream.pipeThrough(new JsonToSseTransformStream())
    );
  } catch (error) {
    console.error("Chat API failure:", error);
    return new ChatSDKError("offline:chat").toResponse();
  }
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });
  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });
  return Response.json(deletedChat, { status: 200 });
}
