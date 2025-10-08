"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { QuizAttempt } from "@/lib/types";

interface QuizHistoryProps {
  attempts: QuizAttempt[];
}

export function QuizHistory({ attempts }: QuizHistoryProps) {
  function getScoreBadge(score: number, total: number) {
    const percentage = (score / total) * 100;
    if (percentage >= 80)
      return <Badge className="bg-green-500">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-500">Good</Badge>;
    if (percentage >= 40) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => {
              const totalQuestions =
                (attempt.questions.mcqs?.length || 0) +
                (attempt.questions.saqs?.length || 0) +
                (attempt.questions.laqs?.length || 0);

              return (
                <TableRow key={attempt.id}>
                  <TableCell>{formatDate(attempt.created_at)}</TableCell>
                  <TableCell>{totalQuestions}</TableCell>
                  <TableCell>
                    {attempt.score} / {totalQuestions}
                  </TableCell>
                  <TableCell>
                    {getScoreBadge(attempt.score, totalQuestions)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
