import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pdfId, questions, answers, score } = await request.json();
    const supabase = await createClient();

    const { error } = await supabase.from("quiz_attempts").insert({
      pdf_id: pdfId,
      questions,
      answers,
      score,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
  }
}
