"use client";

import { ChatMessage as ChatMessageType } from "@/lib/types";
import { User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  function handleCitationClick(page: number) {
    // Trigger PDF viewer to jump to page
    window.dispatchEvent(new CustomEvent("jumpToPage", { detail: { page } }));
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg ${
          isUser ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-gray-700" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col space-y-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 max-w-2xl ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.citations.map((citation, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleCitationClick(citation.page)}
              >
                <Badge variant="secondary" className="mr-1">
                  Page {citation.page}
                </Badge>
                &quot;{citation.quote.substring(0, 50)}...&quot;
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
