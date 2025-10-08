"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { usePDFStore } from "@/hooks/use-pdfs";
import { Loader2 } from "lucide-react";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [chatId, setChatId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { selectedPDF } = usePDFStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create new chat on mount
    const newChatId = crypto.randomUUID();
    setChatId(newChatId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      chat_id: chatId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          pdfId: selectedPDF,
          message: content,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        chat_id: chatId,
        role: "assistant",
        content: data.message,
        citations: data.citations,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    const newChatId = crypto.randomUUID();
    setChatId(newChatId);
    setMessages([]);
  }

  function handleLoadChat(
    loadedChatId: string,
    loadedMessages: ChatMessageType[]
  ) {
    setChatId(loadedChatId);
    setMessages(loadedMessages);
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <ChatSidebar
          currentChatId={chatId}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
        />
      </div>

      {/* Main Chat - Full screen on mobile, with space for bottom nav */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages - Add padding bottom for mobile nav */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 lg:pb-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm mt-2">
                  Ask me anything about your coursebook!
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom, above mobile nav */}
        <div className="border-t p-4 bg-white fixed bottom-16 left-0 right-0 lg:static lg:bottom-auto">
          <div className="max-w-4xl mx-auto lg:pl-64">
            <ChatInput onSend={handleSendMessage} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
