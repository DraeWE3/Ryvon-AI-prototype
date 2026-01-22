"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/images/logo.png";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { PlusIcon, TrashIcon } from "@/components/icons";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    const deletePromise = fetch("/api/history", {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        router.push("/");
        setShowDeleteAllDialog(false);
        return "All chats deleted successfully";
      },
      error: "Failed to delete all chats",
    });
  };

  return (
    <>
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader>
          <SidebarMenu>
            <div className="flex flex-row items-center justify-between">
              <Link
                className="flex flex-row items-center gap-3"
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
              >
                <Image 
                  src={Logo} 
                  alt="Logo" 
                  className="w-25 mt-4 ml-2 cursor-pointer hover:bg-muted" 
                />
              </Link>
              <div className="flex flex-row gap-1">
                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-8 p-1 md:h-fit md:p-2"
                        onClick={() => setShowDeleteAllDialog(true)}
                        type="button"
                        variant="ghost"
                      >
                        <TrashIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent align="end" className="hidden md:block">
                      Delete All Chats
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-8 p-1 md:h-fit md:p-2"
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/");
                        router.refresh();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <PlusIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="end" className="hidden md:block">
                    New Chat
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* AI Features Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground">
              AI Features
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Text to Speech */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link 
                      href="/tts"
                      className="flex items-center gap-3 py-2 mb-5"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                        />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Text to Speech</span>
                        <span className="text-xs text-muted-foreground">
                          Convert text to voice
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* AI Call Agent */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link 
                      href="/call-agent"
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">AI Call Agent</span>
                        <span className="text-xs text-muted-foreground">
                          Automated sales calls
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* AI Automation */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link 
                      href="/automation"
                      className="flex items-center gap-3 py-2 mt-5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
                        <rect width="24" height="24" fill="none" />
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 19c0 1.414 0 2.121.44 2.56C3.878 22 4.585 22 6 22s2.121 0 2.56-.44C9 21.122 9 20.415 9 19s0-2.121-.44-2.56C8.122 16 7.415 16 6 16s-2.121 0-2.56.44C3 16.878 3 17.585 3 19ZM3 5c0 1.414 0 2.121.44 2.56C3.878 8 4.585 8 6 8s2.121 0 2.56-.44C9 7.122 9 6.415 9 5s0-2.121-.44-2.56C8.122 2 7.415 2 6 2s-2.121 0-2.56.44C3 2.878 3 3.585 3 5Zm12 9c0 1.414 0 2.121.44 2.56c.439.44 1.146.44 2.56.44s2.121 0 2.56-.44c.44-.439.44-1.146.44-2.56s0-2.121-.44-2.56C20.122 11 19.415 11 18 11s-2.121 0-2.56.44C15 11.878 15 12.585 15 14Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8v8m9-2h-3a6 6 0 0 1-6-6" />
                        </g>
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">AI Automation</span>
                        <span className="text-xs text-muted-foreground">
                          Workflow Automation
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Separator */}
          <div className="my-2 border-t border-border" />

          {/* Chat History */}
          <SidebarHistory user={user} />
        </SidebarContent>

        <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}