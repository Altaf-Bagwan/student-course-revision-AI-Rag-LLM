"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { usePDFStore } from "@/hooks/use-pdfs";
import { toast } from "sonner";

interface QuizGeneratorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuizGenerated: (quiz: any) => void;
}

export function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    saq: true,
    laq: true,
  });
  const [numQuestions, setNumQuestions] = useState([5]);
  const { selectedPDF } = usePDFStore();

  async function generateQuiz() {
    if (!selectedPDF || selectedPDF === "all") {
      toast("Select a PDF", {
        description: "Please select a specific PDF to generate quiz",
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfId: selectedPDF,
          questionTypes,
          numQuestions: numQuestions[0],
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const data = await response.json();
      onQuizGenerated(data.quiz);

      toast("Quiz generated!", {
        description: "Your quiz is ready to take",
      });
    } catch (error) {
      toast("Generation failed", {
        description: "Failed to generate quiz. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold mb-4">Generate Quiz</h3>

        <div className="space-y-4">
          {/* Question Types */}
          <div>
            <Label className="mb-3 block">Question Types</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mcq"
                  checked={questionTypes.mcq}
                  onCheckedChange={(checked) =>
                    setQuestionTypes({
                      ...questionTypes,
                      mcq: checked as boolean,
                    })
                  }
                />
                <label htmlFor="mcq" className="text-sm cursor-pointer">
                  Multiple Choice Questions (MCQ)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saq"
                  checked={questionTypes.saq}
                  onCheckedChange={(checked) =>
                    setQuestionTypes({
                      ...questionTypes,
                      saq: checked as boolean,
                    })
                  }
                />
                <label htmlFor="saq" className="text-sm cursor-pointer">
                  Short Answer Questions (SAQ)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="laq"
                  checked={questionTypes.laq}
                  onCheckedChange={(checked) =>
                    setQuestionTypes({
                      ...questionTypes,
                      laq: checked as boolean,
                    })
                  }
                />
                <label htmlFor="laq" className="text-sm cursor-pointer">
                  Long Answer Questions (LAQ)
                </label>
              </div>
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <Label className="mb-3 block">
              Number of Questions: {numQuestions[0]}
            </Label>
            <Slider
              value={numQuestions}
              onValueChange={setNumQuestions}
              min={3}
              max={15}
              step={1}
              className="w-full"
            />
          </div>

          <Button
            onClick={generateQuiz}
            disabled={generating || !Object.values(questionTypes).some(Boolean)}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
