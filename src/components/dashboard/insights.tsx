"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface InsightsProps {
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export function Insights({ insights }: InsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-900 mb-2">
                🎯 Your Strengths:
              </p>
              <ul className="list-disc list-inside space-y-1 text-green-800">
                {insights.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Weaknesses */}
        {insights.weaknesses.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <p className="font-semibold text-orange-900 mb-2">
                📚 Areas to Improve:
              </p>
              <ul className="list-disc list-inside space-y-1 text-orange-800">
                {insights.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <p className="font-semibold text-blue-900 mb-2">
                💡 Recommendations:
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                {insights.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
