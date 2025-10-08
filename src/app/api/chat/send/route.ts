import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, generateEmbedding } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { chatId, pdfId, message, history } = await request.json();

    const supabase = await createClient();

    // Save user message first
    const { error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        role: "user",
        content: message,
      });

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError);
    }

    // Generate embedding for message
    const queryEmbedding = await generateEmbedding(message);

    // Search for relevant chunks
    const { data: chunks, error: searchError } = await supabase.rpc(
      "match_embeddings",
      {
        query_embedding: queryEmbedding,
        match_pdf_id: pdfId === "all" ? null : pdfId,
        match_count: 5,
      }
    );

    if (searchError) {
      console.error("Search error:", searchError);
    }

    // Build context with citations
    let context = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const citations: any[] = [];

    if (chunks && chunks.length > 0) {
      chunks.forEach((chunk: { page_number: number; chunk_text: string }) => {
        context += `[Page ${chunk.page_number}] ${chunk.chunk_text}\n\n`;
        citations.push({
          page: chunk.page_number,
          quote: chunk.chunk_text.substring(0, 100),
        });
      });
    }

    // Generate response with ChatGPT
    const systemPrompt = context
      ? `You are a helpful physics tutor. Answer questions using ONLY the provided context from the textbook. Always cite page numbers when referencing information. Format citations as: "According to page X: 'quote...'"

Context from textbook:
${context}`
      : "You are a helpful physics tutor. Answer questions based on your knowledge of physics.";

    const messages = [
      { role: "system", content: systemPrompt },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...history.slice(-5).map((msg: { role: any; content: any }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await chatCompletion(messages);

    // Save assistant message
    const { error: assistantMsgError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        role: "assistant",
        content: response,
        citations: citations.length > 0 ? citations : null,
      });

    if (assistantMsgError) {
      console.error("Error saving assistant message:", assistantMsgError);
    }

    return NextResponse.json({ message: response, citations });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat failed",
      },
      { status: 500 }
    );
  }
}
