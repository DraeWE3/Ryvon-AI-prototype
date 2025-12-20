import { openai } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        // Main chat model with vision capabilities
        "chat-model": openai("gpt-4-turbo"),
        
        // Reasoning model - use o1-mini or gpt-4 with reasoning extraction
        "chat-model-reasoning": wrapLanguageModel({
          model: openai("o1-mini"), // or "gpt-4-turbo" if you don't have o1 access
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        
        // Title generation - use faster/cheaper model
        "title-model": openai("gpt-4o-mini"),
        
        // Artifact generation
        "artifact-model": openai("gpt-4-turbo"),
      },
    });