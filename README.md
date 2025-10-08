# 🎓 Student Revision Web App

AI-powered revision tool for students with quiz generation, intelligent chat with citations, and progress tracking.

**🌐 Live Demo:** https://student-course-revision.vercel.app/  
**📹 Demo Video:** 
https://github.com/user-attachments/assets/8be5d193-9222-4207-abb9-1138a7e8cb98


**💻 GitHub:** https://github.com/Altaf-Bagwan/student-course-revision-AI-Rag-LLM

---

## 🚀 Quick Setup & Run

```bash
# Clone repository
git clone https://github.com/Altaf-Bagwan/student-course-revision-AI-Rag-LLM
cd student-course-revision-AI-Rag-LLM

# Install dependencies
npm install

# Setup environment variables (see below)
# Create .env.local file and add your keys

# Run development server
npm run dev
Open http://localhost:3000 in your browser.

🔑 Environment Variables
Create .env.local file:
envNEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key  # Optional
Get Keys:

Supabase: supabase.com → Create Project → Settings → API
OpenAI: platform.openai.com → API Keys
YouTube: console.cloud.google.com → YouTube Data API v3

Database Setup: Run the SQL script from database-schema.sql in Supabase SQL Editor, then create a public storage bucket named pdfs.

✨ Features Implemented
📚 Core Features

Source Selector: Dropdown for All/Specific PDFs with auto-selection
PDF Viewer: Interactive viewer with zoom, navigation, responsive layout
Quiz Generator: MCQ/SAQ/LAQ with AI generation & evaluation
Progress Tracking: Dashboard with charts, statistics, and insights

💬 AI-Powered Chat

Chat UI: ChatGPT-style interface with conversation history
RAG with Citations: Answers with page numbers and exact quotes
YouTube Recommendations: Educational videos based on topics (uses dummy videos as fallback if API key not provided)


🏗️ How I Built This
Tech Stack

Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
Backend: Next.js API Routes, Supabase (PostgreSQL + Storage)
AI: OpenAI GPT-4o-mini, text-embedding-3-small
Vector DB: Supabase pgvector for RAG

Architecture
RAG Pipeline:
PDF Upload → Text Extract → Chunk (1000 chars) → Generate Embeddings
→ Store in pgvector → Query → Similarity Search → GPT-4 with Context → Response with Citations
Quiz Generation:
PDF Text → GPT-4 Structured Prompt → JSON Response → Parse & Display → User Answers
→ AI Evaluation → Store Results → Show Explanations
Key Implementation Details
1. Vector Embeddings (RAG Core)

Chunks text with 200-char overlap for context preservation
Uses OpenAI embeddings (1536 dimensions)
Stores in Supabase pgvector with HNSW indexing
Cosine similarity search retrieves top-5 relevant chunks

2. AI-Powered Evaluation

MCQs: Direct matching
SAQ/LAQ: GPT-4 semantic scoring (0-1 scale)

≥0.9 = Full credit | 0.5-0.9 = Partial | <0.5 = Incorrect



3. Citation System

Each chunk stores page number with text
Prompt instructs: "According to page X: 'quote...'"
Citations displayed as clickable badges


🤖 LLM Tools Used
AI-Assisted Development (Claude & ChatGPT)
Where I Used AI:

Code Generation (60% time saved)

Component boilerplate and structure
API route scaffolding
TypeScript interfaces and types
Complex algorithms (chunking, vector search)
SQL queries and database functions


Debugging (40% faster)

PDF rendering with react-pdf
pgvector setup and optimization
State management bugs


Prompt Engineering

Quiz generation prompts for consistent JSON output
Answer evaluation with scoring rubrics
RAG system prompts for accurate citations


Architecture Decisions

RAG implementation strategy
Database schema design
Vector indexing approach (HNSW)



Example:
Me: "Create quiz interface with MCQ/SAQ/LAQ, independent state per question"
AI: Generated QuizInterface component with proper state management
Result: Saved 3-4 hours of implementation time
```
