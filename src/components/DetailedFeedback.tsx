// root/src/components/DetailedFeedback.tsx

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Star,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { InterviewConfig } from "./InterviewSetup";

interface DetailedFeedbackProps {
  username: string;
  config: InterviewConfig;
  sessionData: {
    totalScore: number;
    timeSpent: number;
    questionsAnswered: number;
    totalQuestions: number;
  };
  onBackToDashboard: () => void;
}

interface QuestionFeedback {
  id: number;
  question: string;
  userAnswer: string;
  aiFeedback: string;
  score: number;
  category: string;
  strengths: string[];
  improvements: string[];
}

export default function DetailedFeedback({
  username,
  config,
  sessionData,
  onBackToDashboard,
}: DetailedFeedbackProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Generate mock detailed feedback data
  const generateQuestionFeedback = (): QuestionFeedback[] => {
    const baseFeedback = [
      {
        id: 1,
        question: "Tell me about yourself and your background.",
        userAnswer:
          "I am a software developer with 3 years of experience in web development...",
        aiFeedback:
          "Your response demonstrates good self-awareness and provides relevant background information. You effectively highlighted your technical skills and experience progression.",
        score: 8.5,
        category: "Introduction",
        strengths: [
          "Clear communication",
          "Relevant experience mentioned",
          "Good structure",
        ],
        improvements: [
          "Could add more specific achievements",
          "Mention career goals",
        ],
      },
      {
        id: 2,
        question: "What interests you most about this role?",
        userAnswer:
          "I'm particularly excited about the opportunity to work with modern technologies...",
        aiFeedback:
          "You showed genuine enthusiasm for the role and connected your interests to the company's tech stack. The response could benefit from more specific examples.",
        score: 7.2,
        category: "Motivation",
        strengths: [
          "Genuine enthusiasm",
          "Research about company",
          "Technical interest",
        ],
        improvements: [
          "More specific examples",
          "Connect to personal growth goals",
        ],
      },
      {
        id: 3,
        question:
          "Describe a challenging project you've worked on recently.",
        userAnswer:
          "Recently, I worked on a complex e-commerce platform that required...",
        aiFeedback:
          "Excellent use of the STAR method to structure your response. You clearly outlined the challenge, your approach, and the positive outcome achieved.",
        score: 9.1,
        category: "Experience",
        strengths: [
          "STAR method usage",
          "Clear problem definition",
          "Quantified results",
        ],
        improvements: [
          "Could mention team collaboration",
          "Discuss lessons learned",
        ],
      },
      {
        id: 4,
        question: "How do you handle working under pressure?",
        userAnswer:
          "When facing tight deadlines, I prioritize tasks based on impact and urgency...",
        aiFeedback:
          "Your response shows good stress management strategies and practical approaches. Including a specific example would strengthen your answer significantly.",
        score: 7.8,
        category: "Behavioral",
        strengths: [
          "Practical strategies",
          "Systematic approach",
          "Professional mindset",
        ],
        improvements: [
          "Add specific example",
          "Mention stress prevention techniques",
        ],
      },
      {
        id: 5,
        question:
          "What are your biggest strengths and weaknesses?",
        userAnswer:
          "My biggest strength is my attention to detail, which helps me write clean code...",
        aiFeedback:
          "You provided balanced insights into your strengths and showed self-awareness about areas for improvement. Good job connecting strengths to job requirements.",
        score: 8.0,
        category: "Self-assessment",
        strengths: [
          "Self-awareness",
          "Connected to role",
          "Honest about weaknesses",
        ],
        improvements: [
          "More concrete examples",
          "Show improvement efforts",
        ],
      },
    ];

    // Return appropriate number based on session data
    return baseFeedback.slice(0, sessionData.questionsAnswered);
  };

  const [questionsFeedback] = useState<QuestionFeedback[]>(
    generateQuestionFeedback,
  );

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleNextQuestion = () => {
    if (
      currentQuestionIndex < questionsFeedback.length - 1 &&
      !isTransitioning
    ) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleQuestionSelect = (index: number) => {
    if (index !== currentQuestionIndex && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "#10B981";
    if (score >= 7.0) return "#F59E0B";
    if (score >= 6.0) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreBadgeVariant = (
    score: number,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 8.5) return "default";
    if (score >= 7.0) return "secondary";
    return "destructive";
  };

  const currentFeedback =
    questionsFeedback[currentQuestionIndex];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#111827" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          backgroundColor: "#1F2937",
          borderColor: "#374151",
        }}
      >
        <div className="container mx-auto px-6 py-6">
          <h1
            className="text-center text-2xl tracking-wide"
            style={{ color: "#FFFFFF" }}
          >
            DETAILED FEEDBACK REPORT PAGE
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question Navigation */}
          <div
            className="border rounded-lg p-6 transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: "#6B7280",
                  color: "#9CA3AF",
                  backgroundColor: "transparent",
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="text-center">
                <h2 className="text-lg mb-2 text-white">
                  Question {currentQuestionIndex + 1} of{" "}
                  {questionsFeedback.length}
                </h2>
                <Badge
                  variant="secondary"
                  className="mb-4 text-white"
                  style={{ backgroundColor: "#374151" }}
                >
                  {currentFeedback?.category}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
                disabled={
                  currentQuestionIndex ===
                  questionsFeedback.length - 1
                }
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: "#6B7280",
                  color: "#9CA3AF",
                  backgroundColor: "transparent",
                }}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Question Dots Navigation */}
            <div className="flex justify-center space-x-2">
              {questionsFeedback.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionSelect(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? "scale-125"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentQuestionIndex
                        ? "#3B82F6"
                        : "#6B7280",
                  }}
                  aria-label={`Go to question ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Question Display */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <MessageCircle
                  className="h-5 w-5 mt-1 flex-shrink-0"
                  style={{ color: "#3B82F6" }}
                />
                <p className="text-lg leading-relaxed text-white">
                  {currentFeedback?.question}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Container */}
          <div
            className={`transition-all duration-300 ${isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
          >
            <Card
              className="shadow-lg border-0 transition-all duration-200 hover:shadow-xl"
              style={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
              }}
            >
              <CardContent className="p-8">
                {/* AI Feedback */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp
                      className="h-5 w-5"
                      style={{ color: "#3B82F6" }}
                    />
                    <h3 className="text-lg text-white">
                      AI Feedback
                    </h3>
                  </div>
                  <p
                    className="leading-relaxed text-base"
                    style={{ color: "#E5E7EB" }}
                  >
                    {currentFeedback?.aiFeedback}
                  </p>
                </div>

                {/* Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Star
                        className="h-5 w-5"
                        style={{ color: "#F59E0B" }}
                      />
                      <span className="text-lg text-white">
                        Score:
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-2xl transition-colors"
                        style={{
                          color: getScoreColor(
                            currentFeedback?.score || 0,
                          ),
                        }}
                      >
                        {currentFeedback?.score}/10
                      </span>
                      <Badge
                        className="text-white"
                        style={{
                          backgroundColor:
                            currentFeedback?.score >= 8.5
                              ? "#10B981"
                              : currentFeedback?.score >= 7.0
                                ? "#F59E0B"
                                : "#EF4444",
                        }}
                      >
                        {currentFeedback?.score >= 8.5
                          ? "Excellent"
                          : currentFeedback?.score >= 7.0
                            ? "Good"
                            : currentFeedback?.score >= 6.0
                              ? "Fair"
                              : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Strengths and Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white mb-3 flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#10B981" }}
                      ></span>
                      <span>Strengths</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentFeedback?.strengths.map(
                        (strength, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                            style={{ color: "#D1D5DB" }}
                          >
                            <span
                              style={{ color: "#10B981" }}
                              className="mt-1"
                            >
                              •
                            </span>
                            <span className="text-sm">
                              {strength}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white mb-3 flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#F59E0B" }}
                      ></span>
                      <span>Areas for Improvement</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentFeedback?.improvements.map(
                        (improvement, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                            style={{ color: "#D1D5DB" }}
                          >
                            <span
                              style={{ color: "#F59E0B" }}
                              className="mt-1"
                            >
                              •
                            </span>
                            <span className="text-sm">
                              {improvement}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to Dashboard Button */}
          <div className="text-center pt-8">
            <Button onClick={onBackToDashboard} variant="outline"
              className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }}>
              <ArrowLeft className="h-4 w-4" />
              <span>
                Back to Dashboard
              </span>
            </Button>
          </div>

          {/* Summary Stats */}
          <div
            className="border rounded-lg p-6 transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
            }}
          >
            <h3
              className="text-center mb-4"
              style={{ color: "#9CA3AF" }}
            >
              Session Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p
                  className="text-2xl"
                  style={{ color: "#3B82F6" }}
                >
                  {sessionData.totalScore}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  Overall Score
                </p>
              </div>
              <div>
                <p
                  className="text-2xl"
                  style={{ color: "#3B82F6" }}
                >
                  {(
                    questionsFeedback.reduce(
                      (sum, q) => sum + q.score,
                      0,
                    ) / questionsFeedback.length
                  ).toFixed(1)}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  Avg Question Score
                </p>
              </div>
              <div>
                <p
                  className="text-2xl"
                  style={{ color: "#3B82F6" }}
                >
                  {
                    questionsFeedback.filter(
                      (q) => q.score >= 8.0,
                    ).length
                  }
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  Strong Answers
                </p>
              </div>
              <div>
                <p
                  className="text-2xl"
                  style={{ color: "#3B82F6" }}
                >
                  {Math.round(sessionData.timeSpent / 60)}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  Minutes Total
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}