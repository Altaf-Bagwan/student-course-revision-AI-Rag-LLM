"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MCQ, SAQ, LAQ } from "@/lib/types";

interface QuestionCardProps {
  question: MCQ | SAQ | LAQ;
  type: "mcq" | "saq" | "laq";
  index: number;
  onAnswer: (answer: string | number) => void;
  userAnswer?: string | number;
  showResult?: boolean;
  isCorrect?: boolean;
}

export function QuestionCard({
  question,
  type,
  index,
  onAnswer,
  userAnswer,
  showResult,
  isCorrect,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState<string>("");

  // Update local state when userAnswer changes
  useEffect(() => {
    if (userAnswer !== undefined && userAnswer !== null) {
      setAnswer(userAnswer.toString());
    } else {
      setAnswer("");
    }
  }, [userAnswer, index]); // Add index to dependencies

  function handleAnswerChange(value: string) {
    setAnswer(value);
    onAnswer(type === "mcq" ? parseInt(value) : value);
  }

  return (
    <Card
      className={
        showResult ? (isCorrect ? "border-green-500" : "border-red-500") : ""
      }
    >
      <CardHeader>
        <CardTitle className="text-lg">
          Question {index + 1}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({type.toUpperCase()})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base">{question.question}</p>

        {type === "mcq" && "options" in question && (
          <RadioGroup
            value={answer}
            onValueChange={handleAnswerChange}
            disabled={showResult}
          >
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={idx.toString()}
                  id={`q${index}-opt${idx}`}
                />
                <Label
                  htmlFor={`q${index}-opt${idx}`}
                  className={`cursor-pointer ${
                    showResult && idx === question.correct
                      ? "text-green-600 font-semibold"
                      : ""
                  }`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {(type === "saq" || type === "laq") && (
          <Textarea
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            rows={type === "laq" ? 8 : 4}
            disabled={showResult}
          />
        )}

        {showResult && "explanation" in question && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Explanation:
            </p>
            <p className="text-sm text-blue-800">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
