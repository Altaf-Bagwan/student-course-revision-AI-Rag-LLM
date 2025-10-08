import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/openai";
import { chunkText, estimatePageNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { pdfId } = await request.json();

    const supabase = await createClient();

    // Get PDF text
    const { data: pdfData, error } = await supabase
      .from("pdfs")
      .select("text_content")
      .eq("id", pdfId)
      .single();

    if (error) throw error;

    // Check if text content exists
    if (!pdfData.text_content || pdfData.text_content.trim().length === 0) {
      return NextResponse.json(
        {
          error: "No text content available. Please extract text first.",
        },
        { status: 400 }
      );
    }

    // Chunk text
    const chunks = chunkText(pdfData.text_content);

    console.log(`Processing ${chunks.length} chunks for embeddings...`);

    // Generate embeddings for each chunk
    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      console.log(`Generating embedding ${i + 1}/${chunks.length}`);

      const embedding = await generateEmbedding(chunk.text);
      const pageNumber = estimatePageNumber(pdfData.text_content, chunk.start);

      embeddings.push({
        pdf_id: pdfId,
        chunk_text: chunk.text,
        page_number: pageNumber,
        embedding,
      });

      // Rate limiting - wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Save to database
    const { error: insertError } = await supabase
      .from("embeddings")
      .insert(embeddings);

    if (insertError) throw insertError;

    console.log(`Successfully created ${embeddings.length} embeddings`);

    return NextResponse.json({
      success: true,
      chunksProcessed: chunks.length,
    });
  } catch (error) {
    console.error("Embedding generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate embeddings",
      },
      { status: 500 }
    );
  }
}
