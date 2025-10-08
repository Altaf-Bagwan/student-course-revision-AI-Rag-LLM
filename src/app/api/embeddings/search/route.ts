import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { query, pdfId, limit = 5 } = await request.json();

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    const supabase = await createClient();

    // Search for similar chunks
    const { data, error } = await supabase.rpc("match_embeddings", {
      query_embedding: queryEmbedding,
      match_pdf_id: pdfId,
      match_count: limit,
    });

    if (error) throw error;

    return NextResponse.json({ chunks: data });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
