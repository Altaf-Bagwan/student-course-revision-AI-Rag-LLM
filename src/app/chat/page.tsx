"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-72">
        <Header />

        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
