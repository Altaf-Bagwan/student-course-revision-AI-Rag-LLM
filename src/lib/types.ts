export interface PDF {
  id: string;
  title: string;
  file_path: string;
  text_content?: string;
  created_at: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface SAQ {
  question: string;
  expected_answer: string;
  keywords: string[];
}

export interface LAQ {
  question: string;
  expected_answer: string;
  rubric: string[];
}

export interface Quiz {
  mcqs: MCQ[];
  saqs: SAQ[];
  laqs: LAQ[];
}

export interface QuizAttempt {
  id: string;
  pdf_id: string;
  questions: Quiz;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: any;
  score: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface Citation {
  page: number;
  quote: string;
}

export interface Embedding {
  id: string;
  pdf_id: string;
  chunk_text: string;
  page_number: number;
  embedding: number[];
}
