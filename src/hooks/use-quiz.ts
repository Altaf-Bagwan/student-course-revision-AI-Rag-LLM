import { create } from "zustand";
import { Quiz } from "@/lib/types";

interface QuizStore {
  currentQuiz: Quiz | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quizResults: any | null;
  setCurrentQuiz: (quiz: Quiz) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setQuizResults: (results: any) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  currentQuiz: null,
  quizResults: null,
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setQuizResults: (results) => set({ quizResults: results }),
  resetQuiz: () => set({ currentQuiz: null, quizResults: null }),
}));
