import { NextRequest, NextResponse } from "next/server";
import { getPDFUrl } from "@/lib/pdf-helper";
import { createClient } from "@/lib/supabase/server";
export async function POST(request: NextRequest) {
  try {
    const { pdfId } = await request.json();

    const supabase = await createClient();

    // Get PDF from database
    const { data: pdfData, error: fetchError } = await supabase
      .from("pdfs")
      .select("file_path")
      .eq("id", pdfId)
      .single();

    if (fetchError) throw fetchError;

    // Get public URL
    const pdfUrl = getPDFUrl(pdfData.file_path);

    console.log("Fetching PDF from:", pdfUrl); // Debug log

    // Download PDF
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdf-parse (server-side only)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const pdfParse = (await import("pdf-parse-fork")).default;

    // Extract text
    const data = await pdfParse(buffer);
    const textContent = data.text;

    if (!textContent || textContent.trim().length === 0) {
      throw new Error("No text content extracted from PDF");
    }

    // Update database with text content
    const { error: updateError } = await supabase
      .from("pdfs")
      .update({ text_content: textContent })
      .eq("id", pdfId);

    if (updateError) throw updateError;

    console.log(
      "Text extracted successfully:",
      textContent.length,
      "characters"
    );

    return NextResponse.json({
      success: true,
      textLength: textContent.length,
      preview: textContent.substring(0, 200),
    });
  } catch (error) {
    console.error("Text extraction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Extraction failed",
      },
      { status: 500 }
    );
  }
}
