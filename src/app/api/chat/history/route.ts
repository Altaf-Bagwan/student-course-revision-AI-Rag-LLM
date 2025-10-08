import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    const supabase = await createClient();

    if (chatId) {
      // Get specific chat messages
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return NextResponse.json({ messages: data });
    } else {
      // Get all chats
      const { data, error } = await supabase
        .from("chat_messages")
        .select("chat_id, content, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by chat_id and get first message as title
      const chatsMap = new Map();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.forEach((msg: any) => {
        if (!chatsMap.has(msg.chat_id)) {
          chatsMap.set(msg.chat_id, {
            id: msg.chat_id,
            title: msg.content.substring(0, 50) + "...",
            updatedAt: msg.created_at,
          });
        }
      });

      return NextResponse.json({ chats: Array.from(chatsMap.values()) });
    }
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
