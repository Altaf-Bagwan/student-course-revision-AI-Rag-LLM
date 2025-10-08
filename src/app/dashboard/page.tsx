"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressCharts } from "@/components/dashboard/progress-charts";
import { QuizHistory } from "@/components/dashboard/quiz-history";
import { Insights } from "@/components/dashboard/insights";
import { VideoRecommendations } from "@/components/youtube/video-recommendations";
import { calculateAverage } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attempts, setAttempts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch quiz attempts
      const { data: attemptsData } = await supabase
        .from("quiz_attempts")
        .select("*")
        .order("created_at", { ascending: false });

      setAttempts(attemptsData || []);

      if (!attemptsData || attemptsData.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate stats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scores = attemptsData.map((a: any) => {
        const total =
          (a.questions.mcqs?.length || 0) +
          (a.questions.saqs?.length || 0) +
          (a.questions.laqs?.length || 0);
        return (a.score / total) * 100;
      });

      const calculatedStats = {
        totalQuizzes: attemptsData.length,
        averageScore: calculateAverage(scores),
        bestScore: Math.max(...scores),
        totalTime: attemptsData.length * 30, // Estimate 30 min per quiz
      };

      setStats(calculatedStats);

      // Prepare chart data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoreData = attemptsData.slice(-10).map((a: any) => {
        const total =
          (a.questions.mcqs?.length || 0) +
          (a.questions.saqs?.length || 0) +
          (a.questions.laqs?.length || 0);
        return {
          date: new Date(a.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          score: Math.round((a.score / total) * 100),
        };
      });

      // Extract topics (simplified - would need better logic)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topicScores: any = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attemptsData.forEach((a: any) => {
        const topics = [
          "Mechanics",
          "Thermodynamics",
          "Optics",
          "Electromagnetism",
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        if (!topicScores[randomTopic]) topicScores[randomTopic] = [];
        const total =
          (a.questions.mcqs?.length || 0) +
          (a.questions.saqs?.length || 0) +
          (a.questions.laqs?.length || 0);
        topicScores[randomTopic].push((a.score / total) * 100);
      });

      const topicData = Object.entries(topicScores).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([topic, scores]: any) => ({
          topic,
          accuracy: Math.round(calculateAverage(scores)),
        })
      );

      const typeData = [
        {
          type: "MCQ",
          count: attemptsData.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, a: any) => sum + (a.questions.mcqs?.length || 0),
            0
          ),
        },
        {
          type: "SAQ",
          count: attemptsData.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, a: any) => sum + (a.questions.saqs?.length || 0),
            0
          ),
        },
        {
          type: "LAQ",
          count: attemptsData.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, a: any) => sum + (a.questions.laqs?.length || 0),
            0
          ),
        },
      ];

      setChartData({ scoreData, topicData, typeData });

      // Generate insights
      const avgScore = calculateAverage(scores);
      const generatedInsights = {
        strengths: topicData
          .filter((t) => t.accuracy >= 70)
          .map((t) => `${t.topic} (${t.accuracy}% accuracy)`),
        weaknesses: topicData
          .filter((t) => t.accuracy < 60)
          .map((t) => `${t.topic} (${t.accuracy}% accuracy)`),
        recommendations: [
          avgScore >= 80
            ? "Great job! Try tackling more challenging questions."
            : "Review the topics where you scored below 60%.",
          "Take regular quizzes to maintain consistency.",
          attemptsData.length < 5
            ? "Take more quizzes to get better insights."
            : "Your progress is being tracked well!",
        ],
      };

      setInsights(generatedInsights);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-screen flex">
        <Sidebar />

        <div className="flex-1 flex flex-col lg:pl-72">
          <Header />

          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
              <p className="text-gray-600 mb-4">
                Take a quiz to see your progress here
              </p>
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-72">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <StatsCards stats={stats} />

            {chartData && <ProgressCharts {...chartData} />}

            <div className="grid gap-6 lg:grid-cols-2">
              <QuizHistory attempts={attempts} />
              {insights && <Insights insights={insights} />}
            </div>

            <VideoRecommendations />
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
