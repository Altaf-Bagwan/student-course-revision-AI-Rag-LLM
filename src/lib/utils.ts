import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunkText(
  text: string | null | undefined,
  chunkSize: number = 1000,
  overlap: number = 200
): Array<{ text: string; start: number }> {
  // Handle null/undefined text
  if (!text || typeof text !== "string") {
    console.warn("chunkText received invalid text:", typeof text);
    return [];
  }

  // Ensure overlap is less than chunkSize
  if (overlap >= chunkSize) {
    overlap = Math.floor(chunkSize / 2);
  }

  const chunks: Array<{ text: string; start: number }> = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunkEnd = end;

    // Try to end at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const boundary = Math.max(lastPeriod, lastNewline);

      if (boundary > start + chunkSize / 2) {
        chunkEnd = boundary + 1;
      }
    }

    const chunkTextContent = text.slice(start, chunkEnd).trim();

    if (chunkTextContent.length > 0) {
      chunks.push({
        text: chunkTextContent,
        start,
      });
    }

    // Move start position forward, ensuring progress
    const nextStart = chunkEnd - overlap;

    // Prevent infinite loop - always move forward
    if (nextStart <= start) {
      start = chunkEnd;
    } else {
      start = nextStart;
    }

    // Safety check to prevent infinite loops
    if (chunks.length > 10000) {
      console.error(
        "Too many chunks generated, stopping to prevent memory issues"
      );
      break;
    }
  }

  return chunks;
}

export function estimatePageNumber(
  text: string,
  position: number,
  totalPages: number = 100
): number {
  if (!text || text.length === 0) return 1;
  const percentage = position / text.length;
  return Math.max(1, Math.ceil(percentage * totalPages));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
