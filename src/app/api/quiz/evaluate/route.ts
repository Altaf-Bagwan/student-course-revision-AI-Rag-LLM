import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { quiz, answers } = await request.json();

    let correct = 0;
    let incorrect = 0;
    let partial = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detailed: any[] = [];

    // Evaluate MCQs
    for (let i = 0; i < (quiz.mcqs?.length || 0); i++) {
      const question = quiz.mcqs[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correct;

      detailed.push({ correct: isCorrect, score: isCorrect ? 1 : 0 });
      if (isCorrect) correct++;
      else incorrect++;
    }

    // Evaluate SAQs using ChatGPT
    const saqStartIndex = quiz.mcqs?.length || 0;
    for (let i = 0; i < (quiz.saqs?.length || 0); i++) {
      const question = quiz.saqs[i];
      const userAnswer = answers[saqStartIndex + i];

      const evaluationPrompt = `Evaluate this answer on a scale of 0-1:

Question: ${question.question}
Expected Answer: ${question.expected_answer}
Keywords: ${question.keywords.join(", ")}
Student Answer: ${userAnswer}

Return ONLY a JSON object: {"score": 0.0-1.0, "feedback": "brief feedback"}`;

      const evaluation = await chatCompletion([
        { role: "system", content: "You are evaluating student answers." },
        { role: "user", content: evaluationPrompt },
      ]);

      const result = JSON.parse(evaluation || '{"score": 0}');
      detailed.push({ correct: result.score >= 0.7, score: result.score });

      if (result.score >= 0.9) correct++;
      else if (result.score >= 0.5) {
        partial++;
        correct += 0.5;
      } else incorrect++;
    }

    // Evaluate LAQs using ChatGPT
    const laqStartIndex = saqStartIndex + (quiz.saqs?.length || 0);
    for (let i = 0; i < (quiz.laqs?.length || 0); i++) {
      const question = quiz.laqs[i];
      const userAnswer = answers[laqStartIndex + i];

      const evaluationPrompt = `Evaluate this detailed answer on a scale of 0-1:

Question: ${question.question}
Expected Answer: ${question.expected_answer}
Rubric: ${question.rubric.join(", ")}
Student Answer: ${userAnswer}

Return ONLY a JSON object: {"score": 0.0-1.0, "feedback": "detailed feedback"}`;

      const evaluation = await chatCompletion([
        { role: "system", content: "You are evaluating student answers." },
        { role: "user", content: evaluationPrompt },
      ]);

      const result = JSON.parse(evaluation || '{"score": 0}');
      detailed.push({ correct: result.score >= 0.7, score: result.score });

      if (result.score >= 0.9) correct++;
      else if (result.score >= 0.5) {
        partial++;
        correct += 0.5;
      } else incorrect++;
    }

    const totalQuestions =
      (quiz.mcqs?.length || 0) +
      (quiz.saqs?.length || 0) +
      (quiz.laqs?.length || 0);

    return NextResponse.json({
      score: Math.round(correct),
      totalQuestions,
      correct: Math.floor(correct),
      incorrect,
      partial,
      detailed,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
