"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./question-card";
import { Quiz } from "@/lib/types";
import { usePDFStore } from "@/hooks/use-pdfs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuizInterfaceProps {
  quiz: Quiz;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (results: any) => void;
}

export function QuizInterface({ quiz, onComplete }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [submitting, setSubmitting] = useState(false);
  const { selectedPDF } = usePDFStore();

  const allQuestions = [
    ...(quiz.mcqs || []).map((q) => ({ ...q, type: "mcq" as const })),
    ...(quiz.saqs || []).map((q) => ({ ...q, type: "saq" as const })),
    ...(quiz.laqs || []).map((q) => ({ ...q, type: "laq" as const })),
  ];

  function handleAnswer(index: number, answer: string | number) {
    // Create a new answers object with the updated answer
    setAnswers((prev) => ({
      ...prev,
      [index]: answer,
    }));
  }

  function goToNext() {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function goToPrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  async function handleSubmit() {
    // Check if all questions are answered
    const unansweredIndices = [];
    for (let i = 0; i < allQuestions.length; i++) {
      if (
        answers[i] === undefined ||
        answers[i] === null ||
        answers[i] === ""
      ) {
        unansweredIndices.push(i + 1);
      }
    }

    if (unansweredIndices.length > 0) {
      toast("Incomplete quiz", {
        description: `Please answer all questions. Missing: Question(s) ${unansweredIndices.join(
          ", "
        )}`,
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz,
          answers,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const results = await response.json();

      // Save to database
      await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfId: selectedPDF,
          questions: quiz,
          answers,
          score: results.score,
        }),
      });

      // Pass both results and answers to parent
      onComplete({ ...results, answers });
    } catch (error) {
      toast("Submission failed", {
        description: "Failed to submit quiz. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const currentQ = allQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / allQuestions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>
            {currentQuestion + 1} / {allQuestions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        key={currentQuestion} // IMPORTANT: Add key to force re-render
        question={currentQ}
        type={currentQ.type}
        index={currentQuestion}
        onAnswer={(answer) => handleAnswer(currentQuestion, answer)}
        userAnswer={answers[currentQuestion]}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          Previous
        </Button>

        {currentQuestion === allQuestions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        ) : (
          <Button onClick={goToNext}>Next</Button>
        )}
      </div>

      {/* Answer Status */}
      <div className="flex flex-wrap gap-2 mt-4">
        {allQuestions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestion(idx)}
            className={`w-10 h-10 rounded-full text-sm font-semibold ${
              answers[idx] !== undefined &&
              answers[idx] !== null &&
              answers[idx] !== ""
                ? "bg-green-500 text-white"
                : currentQuestion === idx
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
