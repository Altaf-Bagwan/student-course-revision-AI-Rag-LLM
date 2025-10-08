"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PDFUpload({
  onUploadSuccess,
}: {
  onUploadSuccess?: (pdfId: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.includes("pdf")) {
      toast("Invalid file type", {
        description: "Please upload a PDF file",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload PDF
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/pdfs/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const { pdfId } = await uploadResponse.json();

      // Extract text
      const extractResponse = await fetch("/api/pdfs/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId }),
      });

      if (!extractResponse.ok) {
        console.warn("Text extraction failed, but upload succeeded");
      }

      // Generate embeddings in background (don't wait)
      fetch("/api/embeddings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId }),
      }).catch((err) => console.error("Embedding generation failed:", err));

      toast("Success!", {
        description: "PDF uploaded and processed successfully",
      });

      // Pass the PDF ID back to parent
      onUploadSuccess?.(pdfId);
    } catch (error) {
      console.error("Upload error:", error);
      toast("Upload failed", {
        description: "Failed to upload PDF. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {uploading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">
              Uploading and processing PDF...
            </p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drag and drop your PDF here, or
              </p>
              <label htmlFor="file-upload">
                <Button variant="link" className="mt-1" asChild>
                  <span>browse files</span>
                </Button>
              </label>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleChange}
              disabled={uploading}
            />
          </>
        )}
      </div>
    </div>
  );
}
