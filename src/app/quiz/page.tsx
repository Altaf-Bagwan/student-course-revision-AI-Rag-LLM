"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { QuizGenerator } from "@/components/quiz/quiz-generator";
import { QuizInterface } from "@/components/quiz/quiz-interface";
import { QuizResults } from "@/components/quiz/quiz-results";
import { useQuizStore } from "@/hooks/use-quiz";

export default function QuizPage() {
  const [quizState, setQuizState] = useState<"generate" | "taking" | "results">(
    "generate"
  );
  const {
    currentQuiz,
    quizResults,
    setCurrentQuiz,
    setQuizResults,
    resetQuiz,
  } = useQuizStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedAnswers, setSavedAnswers] = useState<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleQuizGenerated(quiz: any) {
    setCurrentQuiz(quiz);
    setSavedAnswers({}); // Reset answers for new quiz
    setQuizState("taking");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleQuizComplete(results: any) {
    setSavedAnswers(results.answers); // Save answers
    setQuizResults(results);
    setQuizState("results");
  }

  function handleNewQuiz() {
    resetQuiz();
    setSavedAnswers({});
    setQuizState("generate");
  }

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-72">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Quiz</h1>
              {quizState !== "generate" && (
                <button
                  onClick={handleNewQuiz}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Generate New Quiz
                </button>
              )}
            </div>

            {quizState === "generate" && (
              <QuizGenerator onQuizGenerated={handleQuizGenerated} />
            )}

            {quizState === "taking" && currentQuiz && (
              <QuizInterface
                quiz={currentQuiz}
                onComplete={handleQuizComplete}
              />
            )}

            {quizState === "results" && quizResults && currentQuiz && (
              <QuizResults
                results={quizResults}
                quiz={currentQuiz}
                answers={savedAnswers}
                onNewQuiz={handleNewQuiz}
              />
            )}
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
