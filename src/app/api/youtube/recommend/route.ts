import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { pdfId, topic } = await request.json();
    const supabase = await createClient();

    // Check if YouTube API key exists
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    if (!youtubeApiKey) {
      console.log("YouTube API key not found, returning dummy videos");

      // Return dummy videos for testing
      const dummyVideos = [
        {
          id: "dummy-1",
          title: "NCERT Class 11 Physics - Chapter 1: Physical World",
          channel: "Physics Wallah",
          thumbnail:
            "https://placehold.co/320x180/3b82f6/ffffff?text=Physics+Video+1",
          duration: "25:30",
          url: "https://www.youtube.com/results?search_query=ncert+class+11+physics+physical+world",
        },
        {
          id: "dummy-2",
          title: "Laws of Motion Explained - Newton's Laws",
          channel: "Khan Academy",
          thumbnail:
            "https://placehold.co/320x180/10b981/ffffff?text=Physics+Video+2",
          duration: "18:45",
          url: "https://www.youtube.com/results?search_query=newton+laws+of+motion",
        },
        {
          id: "dummy-3",
          title: "Motion in a Straight Line - Complete Chapter",
          channel: "Vedantu",
          thumbnail:
            "https://placehold.co/320x180/f59e0b/ffffff?text=Physics+Video+3",
          duration: "32:15",
          url: "https://www.youtube.com/results?search_query=motion+in+straight+line",
        },
        {
          id: "dummy-4",
          title: "Fundamental Forces in Nature",
          channel: "Science Simplified",
          thumbnail:
            "https://placehold.co/320x180/ef4444/ffffff?text=Physics+Video+4",
          duration: "15:20",
          url: "https://www.youtube.com/results?search_query=fundamental+forces+nature",
        },
        {
          id: "dummy-5",
          title: "Units and Measurements - Physics Class 11",
          channel: "Unacademy",
          thumbnail:
            "https://placehold.co/320x180/8b5cf6/ffffff?text=Physics+Video+5",
          duration: "22:10",
          url: "https://www.youtube.com/results?search_query=units+measurements+physics",
        },
        {
          id: "dummy-6",
          title: "Complete Physics Revision - NCERT Class 11",
          channel: "ExamFear Education",
          thumbnail:
            "https://placehold.co/320x180/ec4899/ffffff?text=Physics+Video+6",
          duration: "45:30",
          url: "https://www.youtube.com/results?search_query=class+11+physics+revision",
        },
      ];

      return NextResponse.json({ videos: dummyVideos });
    }

    // If API key exists, try to use real YouTube API
    let searchQuery = topic;

    if (!topic && pdfId) {
      // Extract topics from PDF using ChatGPT
      const { data: pdfData, error } = await supabase
        .from("pdfs")
        .select("text_content, title")
        .eq("id", pdfId)
        .single();

      if (error) throw error;

      const textSample = pdfData.text_content?.substring(0, 5000) || "";

      const topicsPrompt = `Extract 3-5 main physics topics from this text. Return ONLY a comma-separated list.

${textSample}`;

      const topicsResponse = await chatCompletion([
        {
          role: "system",
          content: "You extract key topics from educational text.",
        },
        { role: "user", content: topicsPrompt },
      ]);

      searchQuery = topicsResponse || "NCERT Class 11 Physics";
    }

    // Call YouTube Data API
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      `${searchQuery} NCERT physics class 11`
    )}&type=video&maxResults=6&key=${youtubeApiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.error) {
      console.error("YouTube API error:", data.error);
      throw new Error(data.error.message);
    }

    const videos =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: "N/A",
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube recommendation error:", error);

    // Return dummy videos as fallback on any error
    const fallbackVideos = [
      {
        id: "fallback-1",
        title: "NCERT Physics Class 11 - Complete Course",
        channel: "Educational Channel",
        thumbnail:
          "https://placehold.co/320x180/3b82f6/ffffff?text=Physics+Course",
        duration: "30:00",
        url: "https://www.youtube.com/results?search_query=class+11+physics",
      },
      {
        id: "fallback-2",
        title: "Physics Fundamentals Explained",
        channel: "Learn Physics",
        thumbnail:
          "https://placehold.co/320x180/10b981/ffffff?text=Fundamentals",
        duration: "20:15",
        url: "https://www.youtube.com/results?search_query=physics+fundamentals",
      },
      {
        id: "fallback-3",
        title: "Quick Revision - Physics Class 11",
        channel: "Quick Learning",
        thumbnail:
          "https://placehold.co/320x180/f59e0b/ffffff?text=Quick+Revision",
        duration: "15:30",
        url: "https://www.youtube.com/results?search_query=physics+quick+revision",
      },
    ];

    return NextResponse.json({ videos: fallbackVideos });
  }
}
