import { supabase } from "@/lib/supabase/client";

export const PDF_BUCKET = "pdfs";

// Helper functions
export async function uploadPDF(file: File) {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(PDF_BUCKET).getPublicUrl(fileName);

  return { path: data.path, url: publicUrl };
}

// FIXED: Return string directly, not Promise
export function getPDFUrl(path: string): string {
  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(path);

  return data.publicUrl;
}
