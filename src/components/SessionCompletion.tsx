// root/src/components/SessionCompletion.tsx

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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

interface SessionCompletionProps {
  username: string;
  config: InterviewConfig;
  sessionData: {
    totalScore: number;
    timeSpent: number; // in seconds
    questionsAnswered: number;
    totalQuestions: number;
  };
  onBackToDashboard: () => void;
  onViewDetailedFeedback: () => void;
}

export default function SessionCompletion({
  username,
  config,
  sessionData,
  onBackToDashboard,
  onViewDetailedFeedback,
}: SessionCompletionProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Mock performance data
  const performanceData = {
    strengths: [
      "Clear and structured responses",
      "Good technical knowledge demonstration",
      "Confident communication style",
      "Relevant examples and experiences",
      "Professional demeanor throughout",
    ],
    weaknesses: [
      "Could elaborate more on specific examples",
      "Time management in longer responses",
      "Technical depth in some areas",
      "Body language and eye contact",
      "Follow-up question handling",
    ],
  };

  useEffect(() => {
    // Trigger animations
    setShowConfetti(true);
    setTimeout(() => {
      setShowContent(true);
    }, 500);

    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Outstanding performance! 🎉";
    if (score >= 80) return "Excellent work! 🌟";
    if (score >= 70) return "Great job! 👏";
    if (score >= 60) return "Good effort! 👍";
    return "Keep practicing! 💪";
  };

  const handleDownloadReport = () => {
    // Mock PDF download
    console.log("Downloading PDF report...");
    alert("PDF report download would start here");
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#111827" }}
    >
      {/* Confetti Animation */}
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
        className={`container mx-auto px-8 py-12 transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
            <Trophy
              className="h-6 w-6"
              style={{ color: "#F59E0B" }}
            />
            <p className="text-2xl text-white">
              {getPerformanceMessage(sessionData.totalScore)}
            </p>
            <Trophy
              className="h-6 w-6"
              style={{ color: "#F59E0B" }}
            />
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
                  <span
                    style={{
                      color: getScoreColor(
                        sessionData.totalScore,
                      ),
                    }}
                  >
                    {sessionData.totalScore}/100
                  </span>
                </p>
                <p className="text-white text-xl">
                  Time Taken:{" "}
                  <span style={{ color: "#3B82F6" }}>
                    {formatTime(sessionData.timeSpent)}
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
                Questions: {sessionData.questionsAnswered}/
                {sessionData.totalQuestions}
              </Badge>
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
              <p style={{ color: "#9CA3AF" }}>
                Interview Completed
              </p>
            </div>
          </div>
        </div>

        {/* Performance Charts Icons */}
        <div className="flex justify-center items-center space-x-16 mb-16">
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: "rgba(55, 65, 81, 0.5)",
              }}
            >
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">
              Performance Trend
            </p>
          </div>

          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: "rgba(55, 65, 81, 0.5)",
              }}
            >
              <PieChart className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">
              Category Distribution
            </p>
          </div>

          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: "rgba(55, 65, 81, 0.5)",
              }}
            >
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">
              Answer Progression
            </p>
          </div>
        </div>

        {/* Feedback Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Strengths */}
          <div>
            <h3 className="text-white mb-4 flex items-center space-x-2">
              <Star
                className="h-5 w-5"
                style={{ color: "#10B981" }}
              />
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
                <ul className="space-y-3">
                  {performanceData.strengths.map(
                    (strength, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2"
                        style={{
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <span
                          style={{ color: "#10B981" }}
                          className="mt-1"
                        >
                          •
                        </span>
                        <span className="text-sm leading-relaxed">
                          {strength}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="text-white mb-4 flex items-center space-x-2">
              <Target
                className="h-5 w-5"
                style={{ color: "#F59E0B" }}
              />
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
                <ul className="space-y-3">
                  {performanceData.weaknesses.map(
                    (weakness, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2"
                        style={{
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        <span
                          style={{ color: "#F59E0B" }}
                          className="mt-1"
                        >
                          •
                        </span>
                        <span className="text-sm leading-relaxed">
                          {weakness}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button
            onClick={handleDownloadReport}
            className="px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-white hover:scale-105"
            style={{ backgroundColor: "#3B82F6" }}
            size="lg"
          >
            <Download className="h-5 w-5" />
            <span className="uppercase tracking-wide">
              Download Report PDF
            </span>
          </Button>

          <Button
            onClick={onViewDetailedFeedback}
            className="px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-white hover:scale-105"
            style={{ backgroundColor: "#10B981" }}
            size="lg"
          >
            <Search className="h-5 w-5" />
            <span className="uppercase tracking-wide">
              View Detailed Feedback
            </span>
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={onBackToDashboard}
            className="transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "#FFFFFF",
              backgroundColor: "transparent",
            }}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Next Steps Indicator */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            💡 Tip: Review your detailed feedback to identify
            specific areas for improvement
          </p>
        </div>
      </div>
    </div>
  );
}