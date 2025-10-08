"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "./question-card";
import { CheckCircle2, XCircle, Award } from "lucide-react";

interface QuizResultsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiz: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: any;
  onNewQuiz: () => void;
}

export function QuizResults({
  results,
  quiz,
  answers,
  onNewQuiz,
}: QuizResultsProps) {
  const allQuestions = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(quiz.mcqs || []).map((q: any) => ({ ...q, type: "mcq" })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(quiz.saqs || []).map((q: any) => ({ ...q, type: "saq" })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(quiz.laqs || []).map((q: any) => ({ ...q, type: "laq" })),
  ];

  const percentage = (results.score / results.totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="border-2 border-blue-500">
        <CardHeader className="text-center">
          <Award className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <p className="text-5xl font-bold text-blue-600">
              {Math.round(percentage)}%
            </p>
            <p className="text-gray-600 mt-2">
              {results.score} out of {results.totalQuestions} correct
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {results.correct}
              </p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {results.incorrect}
              </p>
              <p className="text-sm text-gray-600">Incorrect</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <Award className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                {results.partial || 0}
              </p>
              <p className="text-sm text-gray-600">Partial</p>
            </div>
          </div>

          <Button onClick={onNewQuiz} size="lg" className="mt-6">
            Generate New Quiz
          </Button>
        </CardContent>
      </Card>

      {/* Review Answers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Review Your Answers</h3>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {allQuestions.map((question: any, idx: number) => (
          <QuestionCard
            key={idx}
            question={question}
            type={question.type}
            index={idx}
            onAnswer={() => {}}
            userAnswer={answers?.[idx]} // Add optional chaining
            showResult={true}
            isCorrect={results.detailed?.[idx]?.correct} // Add optional chaining
          />
        ))}
      </div>
    </div>
  );
}
