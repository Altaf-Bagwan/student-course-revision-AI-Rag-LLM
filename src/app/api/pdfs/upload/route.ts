import { uploadPDF } from "@/lib/pdf-helper";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const { path, url } = await uploadPDF(file);
    const supabase = await createClient();
    // Save metadata to database
    const { data, error } = await supabase
      .from("pdfs")
      .insert({
        title: file.name,
        file_path: path,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ pdfId: data.id, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
