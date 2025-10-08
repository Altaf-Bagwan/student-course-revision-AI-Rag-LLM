"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ChatSidebarProps {
  currentChatId: string;
  onNewChat: () => void;
  onLoadChat: (chatId: string, messages: ChatMessage[]) => void;
}

export function ChatSidebar({
  currentChatId,
  onNewChat,
  onLoadChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<
    { id: string; title: string; updatedAt: string }[]
  >([]);

  useEffect(() => {
    fetchChats();
  }, [currentChatId]);

  async function fetchChats() {
    try {
      const response = await fetch("/api/chat/history");
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  }

  async function handleChatClick(chatId: string) {
    try {
      const response = await fetch(`/api/chat/history?chatId=${chatId}`);
      const data = await response.json();
      onLoadChat(chatId, data.messages);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  }

  return (
    <div className="w-64 border-r border-gray-200 bg-white hidden lg:flex lg:flex-col">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-2 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                chat.id === currentChatId ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(chat.updatedAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
