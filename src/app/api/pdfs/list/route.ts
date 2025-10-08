import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pdfs")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ pdfs: data });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json({ error: "Failed to list PDFs" }, { status: 500 });
  }
}
