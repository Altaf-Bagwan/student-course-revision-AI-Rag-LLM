import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { pdfId, questionTypes, numQuestions } = await request.json();
    const supabase = await createClient();

    // Get PDF text
    const { data: pdfData, error } = await supabase
      .from("pdfs")
      .select("text_content")
      .eq("id", pdfId)
      .single();

    if (error) throw error;

    // Limit text for context (use first 10000 chars for speed)
    const textSample = pdfData.text_content.substring(0, 10000);

    // Calculate question distribution - FIXED
    const totalTypes = Object.values(questionTypes).filter(Boolean).length;
    const questionsPerType = Math.floor(numQuestions / totalTypes);
    const remainder = numQuestions % totalTypes;

    let mcqCount = 0;
    let saqCount = 0;
    let laqCount = 0;

    // Distribute questions evenly
    if (questionTypes.mcq) mcqCount = questionsPerType;
    if (questionTypes.saq) saqCount = questionsPerType;
    if (questionTypes.laq) laqCount = questionsPerType;

    // Distribute remainder
    let remainingToDistribute = remainder;
    if (questionTypes.mcq && remainingToDistribute > 0) {
      mcqCount++;
      remainingToDistribute--;
    }
    if (questionTypes.saq && remainingToDistribute > 0) {
      saqCount++;
      remainingToDistribute--;
    }
    if (questionTypes.laq && remainingToDistribute > 0) {
      laqCount++;
      remainingToDistribute--;
    }

    // Verify total equals numQuestions
    const totalCount = mcqCount + saqCount + laqCount;
    console.log(
      `Generating ${mcqCount} MCQs, ${saqCount} SAQs, ${laqCount} LAQs (Total: ${totalCount})`
    );

    // Generate quiz using ChatGPT
    const prompt = `You are a physics teacher creating a quiz from a textbook. Generate questions based on this text:

${textSample}

Generate EXACTLY:
- ${mcqCount} Multiple Choice Questions (4 options each)
- ${saqCount} Short Answer Questions (2-3 sentence answers)
- ${laqCount} Long Answer Questions (detailed answers)

IMPORTANT: Generate exactly the number requested, no more, no less.

Return ONLY valid JSON in this exact format:
{
  "mcqs": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct": 0,
      "explanation": "string"
    }
  ],
  "saqs": [
    {
      "question": "string",
      "expected_answer": "string",
      "keywords": ["string", "string"]
    }
  ],
  "laqs": [
    {
      "question": "string",
      "expected_answer": "string",
      "rubric": ["string", "string", "string"]
    }
  ]
}`;

    const response = await chatCompletion([
      {
        role: "system",
        content:
          "You are a physics teacher creating educational quizzes. Always generate exactly the number of questions requested.",
      },
      { role: "user", content: prompt },
    ]);

    // Parse response
    const quiz = JSON.parse(response || "{}");

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
