"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDF } from "@/lib/types";
import { usePDFStore } from "@/hooks/use-pdfs";
import { supabase } from "@/lib/supabase/client";

export function SourceSelector() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const { selectedPDF, setSelectedPDF } = usePDFStore();

  useEffect(() => {
    fetchPDFs();

    // Set up real-time subscription for PDF changes
    const channel = supabase
      .channel("pdfs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pdfs" },
        () => {
          fetchPDFs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPDFs() {
    try {
      const { data } = await supabase
        .from("pdfs")
        .select("*")
        .order("created_at", { ascending: false });

      setPdfs(data || []);

      // If no PDF is selected and we have PDFs, select the first one
      if (data && data.length > 0 && !selectedPDF) {
        setSelectedPDF(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Source:</span>
      <Select value={selectedPDF || "all"} onValueChange={setSelectedPDF}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a PDF" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Uploaded PDFs</SelectItem>
          {pdfs.map((pdf) => (
            <SelectItem key={pdf.id} value={pdf.id}>
              {pdf.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
