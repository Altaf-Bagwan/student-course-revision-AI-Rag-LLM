"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { PDFUpload } from "@/components/pdf/pdf-upload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePDFStore } from "@/hooks/use-pdfs";
import { supabase } from "@/lib/supabase/client";
import { getPDFUrl } from "@/lib/pdf-helper";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// FIXED: Import PDFViewer dynamically to avoid SSR issues
const PDFViewer = dynamic(
  () => import("@/components/pdf/pdf-viewer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    ),
  }
);

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const { selectedPDF, setSelectedPDF } = usePDFStore();
  const [activeTab, setActiveTab] = useState("pdf");

  useEffect(() => {
    fetchPDFs();
  }, []);

  useEffect(() => {
    if (selectedPDF && selectedPDF !== "all") {
      loadPDF();
    }
  }, [selectedPDF, pdfs]);

  async function fetchPDFs() {
    const { data } = await supabase
      .from("pdfs")
      .select("*")
      .order("created_at", { ascending: false });

    setPdfs(data || []);
  }

  function loadPDF() {
    const pdf = pdfs.find((p) => p.id === selectedPDF);
    if (pdf) {
      const url = getPDFUrl(pdf.file_path);
      setPdfUrl(url);
    }
  }

  async function handleUploadSuccess(newPdfId: string) {
    // Refresh PDFs list
    const { data } = await supabase
      .from("pdfs")
      .select("*")
      .order("created_at", { ascending: false });

    setPdfs(data || []);

    // Auto-select the newly uploaded PDF
    setSelectedPDF(newPdfId);

    // Switch to PDF viewer tab
    setActiveTab("pdf");

    // Load the PDF URL
    if (data && data.length > 0) {
      const newPdf = data.find((p) => p.id === newPdfId);
      if (newPdf) {
        const url = getPDFUrl(newPdf.file_path);
        setPdfUrl(url);
      }
    }
  }

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-72">
        <Header />

        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 lg:p-8">
            <div className="h-full max-w-7xl mx-auto">
              {pdfs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                  <div className="text-center space-y-4">
                    <BookOpen className="h-24 w-24 mx-auto text-gray-400" />
                    <h1 className="text-4xl font-bold">
                      Welcome to RevisionApp
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                      Upload your coursebook PDF to start generating quizzes,
                      chatting with AI, and tracking your progress
                    </p>
                  </div>

                  <div className="w-full max-w-2xl">
                    <PDFUpload onUploadSuccess={handleUploadSuccess} />
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      NCERT Class XI Physics PDFs are pre-loaded for testing
                    </p>
                  </div>
                </div>
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full"
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="pdf">PDF Viewer</TabsTrigger>
                    <TabsTrigger value="upload">Upload New</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pdf" className="h-[calc(100%-60px)]">
                    {pdfUrl ? (
                      <div className="h-full space-y-4">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-bold">
                            Your Coursebook
                          </h2>
                          <div className="space-x-2">
                            <Link href="/quiz">
                              <Button>Generate Quiz</Button>
                            </Link>
                            <Link href="/chat">
                              <Button variant="outline">Start Chat</Button>
                            </Link>
                          </div>
                        </div>
                        <div className="h-[calc(100%-60px)] border rounded-lg overflow-hidden">
                          <PDFViewer url={pdfUrl} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">
                          Select a PDF from the dropdown above
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="h-[calc(100%-60px)]">
                    <div className="max-w-2xl mx-auto pt-12">
                      <h2 className="text-2xl font-bold mb-6">
                        Upload New PDF
                      </h2>
                      <PDFUpload onUploadSuccess={handleUploadSuccess} />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
