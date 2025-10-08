import { create } from "zustand";

interface PDFStore {
  selectedPDF: string | null;
  setSelectedPDF: (id: string) => void;
}

export const usePDFStore = create<PDFStore>((set) => ({
  selectedPDF: null,
  setSelectedPDF: (id) => set({ selectedPDF: id }),
}));
