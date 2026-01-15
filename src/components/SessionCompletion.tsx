// root/src/components/SessionCompletion.tsx

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import api from "../utils/api";
import {
  Download,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  Star,
  Trophy,
  Target,
} from "lucide-react";
import { InterviewConfig } from "./InterviewSetup";

interface InterviewConfigWithSession extends InterviewConfig {
  sessionId: number;
}

interface SessionCompletionProps {
  username: string;
  config: InterviewConfigWithSession;
  onBackToDashboard: () => void;
  onViewDetailedFeedback: () => void;
}

interface SessionSummary {
  totalScore: number; // 0..10
  timeTakenSeconds: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string[];
}

export default function SessionCompletion({
  username,
  config,
  onBackToDashboard,
  onViewDetailedFeedback,
}: SessionCompletionProps) {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Fetch real session summary
  useEffect(() => {
    setLoading(true);
    api
      .get(`/interview/session-summary/${config.sessionId}`)
      .then((res) => setSummary(res.data))
      .catch((err) => {
        console.error("Failed to load session summary:", err);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [config.sessionId]);

  // Animations (same behavior as your original)
  useEffect(() => {
    if (!loading && summary) {
      setShowConfetti(true);
      setTimeout(() => setShowContent(true), 500);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [loading, summary]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 0..10 score colors (nice, not “all white”)
  const getScoreColor10 = (score10: number) => {
    if (score10 >= 8) return "#10B981"; // green
    if (score10 >= 6) return "#F59E0B"; // amber
    return "#EF4444"; // red
  };

  const getPerformanceMessage10 = (score10: number) => {
    if (score10 >= 9) return "Outstanding performance! 🎉";
    if (score10 >= 8) return "Excellent work! 🌟";
    if (score10 >= 7) return "Great job! 👏";
    if (score10 >= 6) return "Good effort! 👍";
    return "Keep practicing! 💪";
  };

  const handleDownloadReport = async () => {
  try {
    const response = await api.get(
      `/interview/session/${config.sessionId}/report-pdf`,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `session-${config.sessionId}-report.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF download failed:", err);
    alert("Failed to download report");
  }
};

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading session summary...
      </div>
    );
  }

 

  const toCleanBullets = (
  texts: unknown[],
  max = 5,
  short = false
) => {
  const seen = new Set<string>();

  return (Array.isArray(texts) ? texts : [])
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .flatMap(t =>
      t
        .replace(/to improve,.*$/i, "")
        .replace(/however,.*$/i, "")
        .replace(/improve by.*$/i, "")
        .split(/[.\n]/)
        .map(s => s.trim())
    )
    .filter(s => s.length > 15)
    .map(s => {
      if (!short) return s;

      // 🔹 compress sentence into a short phrase
      return s
        .replace(/the answer (is|shows|demonstrates)/i, "")
        .replace(/demonstrating|demonstrates/i, "")
        .replace(/with|and/gi, "")
        .trim();
    })
    .filter(s => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, max)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1));
};


 const strengths = toCleanBullets(summary.strengths, 4, true);
 const weaknesses = toCleanBullets(summary.weaknesses, 4, true);

 // feedback stays detailed
 const feedback = toCleanBullets(summary.feedback, 6, false);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#111827" }}
    >
      {/* Confetti Animation (same as your original) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 animate-pulse">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 opacity-70 animate-bounce"
                style={{
                  backgroundColor: "#3B82F6",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`container mx-auto px-8 py-12 transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-center text-2xl tracking-wide mb-6"
            style={{ color: "#FFFFFF" }}
          >
            SESSION COMPLETION PAGE
          </h1>

          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="h-6 w-6" style={{ color: "#F59E0B" }} />
            <p className="text-2xl text-white">
              {getPerformanceMessage10(summary.totalScore)}
            </p>
            <Trophy className="h-6 w-6" style={{ color: "#F59E0B" }} />
          </div>
        </div>

        {/* Score & Time */}
        <div className="flex items-start justify-between mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Target className="h-6 w-6 text-white" />
              <div>
                <p className="text-white text-xl">
                  Total Score:{" "}
                  <span style={{ color: getScoreColor10(summary.totalScore) }}>
                    {summary.totalScore.toFixed(1)}/10
                  </span>
                </p>

                <p className="text-white text-xl">
                  Time Taken:{" "}
                  <span style={{ color: "#3B82F6" }}>
                    {formatTime(summary.timeTakenSeconds)}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Badge
                variant="secondary"
                className="mr-2 text-white"
                style={{ backgroundColor: "#374151" }}
              >
                Level: {config.level}
              </Badge>

              <Badge
                variant="secondary"
                className="text-white"
                style={{ backgroundColor: "#374151" }}
              >
                Mode: {config.mode}
              </Badge>
            </div>
          </div>

          {/* Well Done Message */}
          <div className="text-right">
            <div className="animate-pulse">
              <Star
                className="h-12 w-12 mx-auto mb-2"
                style={{ color: "#F59E0B" }}
              />
              <p className="text-white text-lg">Well Done!</p>
              <p style={{ color: "#9CA3AF" }}>Interview Completed</p>
            </div>
          </div>
        </div>

        {/* Performance Charts Icons */}
        <div className="flex justify-center items-center space-x-16 mb-16">
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
            >
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">Performance Trend</p>
          </div>

          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
            >
              <PieChart className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">Category Distribution</p>
          </div>

          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
            >
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">Answer Progression</p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Strengths */}
          <div>
            <h3 className="text-white mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5" style={{ color: "#10B981" }} />
              <span>Strengths:</span>
            </h3>

            <Card
              className="border transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <CardContent className="p-6">
                {strengths.length ? (
                  <ul className="space-y-3">
                    {strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2"
                        style={{ color: "rgba(255, 255, 255, 0.9)" }}
                      >
                        <span style={{ color: "#10B981" }} className="mt-1">
                          •
                        </span>
                        <span className="text-sm leading-relaxed">
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    No strong areas identified in this session.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="text-white mb-4 flex items-center space-x-2">
              <Target className="h-5 w-5" style={{ color: "#F59E0B" }} />
              <span>Areas for Improvement:</span>
            </h3>

            <Card
              className="border transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <CardContent className="p-6">
                {weaknesses.length ? (
                  <ul className="space-y-3">
                    {weaknesses.map((weakness, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2"
                        style={{ color: "rgba(255, 255, 255, 0.9)" }}
                      >
                        <span style={{ color: "#F59E0B" }} className="mt-1">
                          •
                        </span>
                        <span className="text-sm leading-relaxed">
                          {weakness}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    No major improvement areas detected.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Feedback Card (keeps same “beautiful” style) */}
        <div className="mb-12">
          <h3 className="text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" style={{ color: "#3B82F6" }} />
            <span>AI Interviewer Summary:</span>
          </h3>

          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "rgba(31, 41, 55, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            <CardContent className="p-6">
              {feedback.length ? (
                <ul className="space-y-3">
                  {feedback.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start space-x-2"
                      style={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <span style={{ color: "#3B82F6" }} className="mt-1">
                        •
                      </span>
                      <span className="text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: "#9CA3AF" }}>
                  No feedback generated for this session.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons (back to your original nice ones) */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button
            onClick={handleDownloadReport}
            size="lg"
            className="px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-white"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Download className="h-5 w-5" />
            <span className="uppercase tracking-wide">
              Download Report PDF
            </span>
          </Button>

          {/* <Button
            onClick={onViewDetailedFeedback}
            className="px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-white hover:scale-105"
            style={{ backgroundColor: "#10B981" }}
            size="lg"
          >
            <Search className="h-5 w-5" />
            <span className="uppercase tracking-wide">
              View Detailed Feedback
            </span>
          </Button> */}
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={onBackToDashboard}
            className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "#6B7280",
              backgroundColor: "rgba(62, 65, 69, 1)",
              color: "#FFFFFF",
            }}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Tip */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            💡 Tip: Review your detailed feedback to identify specific areas for improvement
          </p>
        </div>
      </div>
    </div>
  );
}
