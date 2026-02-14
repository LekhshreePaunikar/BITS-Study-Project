// root/src/components/PastSessions.tsx

// import { useState } from "react";
import { useState, useEffect } from "react";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  User,
  ChevronUp,
  ChevronDown,
  FileText,
  Mic,
  HelpCircle,
  CheckCircle,
  XCircle,
  Lightbulb
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface PastSessionsProps {
  username: string;
  onBackToDashboard: () => void;
}

// interface SessionRecord {
//   id: string;
//   date: string;
//   mode: "Text" | "Voice";
//   score: number;
//   duration: string;
//   role: string;
//   level: string;
//   questionsAnswered: number;
// }

interface Summary {
  totalSessions: number;
  averageScore: number;
  excellentScores: number;
  differentRoles: number;
}

interface ApiSession {
  session_id: number;
  start_time: string;
  selected_difficulty: "easy" | "medium" | "hard";
  interview_mode: "Text" | "Voice";
  question_source: "General" | "Personalized";
  total_score: number;
  stars: number;
  score_label: string;
  duration: string; // MM:SS
  prep_time_minutes: number;
  focus_area: string;
  keywords: string[];
}

export default function PastSessions({ username, onBackToDashboard, }: PastSessionsProps) {

  // const [sortColumn, setSortColumn] = useState<keyof SessionRecord | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof ApiSession | null>(null);

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalSessions: 0,
    averageScore: 0,
    excellentScores: 0,
    differentRoles: 0,
  });
  const [loading, setLoading] = useState(true);

  const [openReportModal, setOpenReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportAvailable, setReportAvailable] = useState(true);
  const [tips, setTips] = useState<string[]>([]);
  const [reportData, setReportData] = useState<{
    strengths: string[];
    weaknesses: string[];
  }>({
    strengths: [],
    weaknesses: [],
  });


  useEffect(() => {
    const token = localStorage.getItem("authToken");


    fetch("/api/past-sessions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res: any) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setSummary(data.summary);
        setSessions(data.sessions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load past sessions", err);
        setLoading(false);
      });
  }, []);

  

  const handleViewReport = async (sessionId: number) => {
    try {
      setReportLoading(true);
      setOpenReportModal(true);

      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `http://localhost:3001/api/performance-report/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch report");

      const data = await res.json();
      setReportAvailable(data.reportAvailable);

      setReportData({
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
      });


      setTips(data.tips ?? []);

    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSort = (column: keyof ApiSession) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc"
        ? "desc"
        : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    const sortedSessions = [...sessions].sort((a, b) => {
      let aVal: any = a[column];
      let bVal: any = b[column];

      // Handle date sorting
      if (column === "start_time") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle total score
      if (column === "total_score") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      // Handle duration sorting (convert to seconds)
      if (column === "duration") {
        const [aMin, aSec] = aVal.split(":").map(Number);
        const [bMin, bSec] = bVal.split(":").map(Number);
        aVal = aMin * 60 + aSec;
        bVal = bMin * 60 + bSec;
      }

      if (aVal < bVal) return newDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setSessions(sortedSessions);
  };



  const getScoreColor = (score: number) => {
    if (score >= 85) return "#10B981";
    if (score >= 70) return "#F59E0B";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };



  const SortIcon = ({
    column,
  }: {
    column: keyof ApiSession;
  }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading past sessions...
      </div>
    );
  }


  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#111827" }}
    >
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151', }}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBackToDashboard}
                className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl mb-2 text-white"> Past Session Page</h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                Previous Mock Interview performances.
              </p>
            </div>
            <div />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card
              className="border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl text-white mb-1">
                  {summary.totalSessions}
                </div>
                <div
                  className="text-lg"
                  style={{ color: "#9CA3AF" }}
                >
                  Total Sessions
                </div>
              </CardContent>
            </Card>

            <Card
              className="border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
              }}
            >
              <CardContent className="p-4 text-center">
                <div
                  className="text-3xl mb-1"
                  style={{ color: getScoreColor(Math.round(summary.averageScore)), }}
                >
                  {summary.totalSessions > 0 ? Math.round(summary.averageScore) : 0}%
                </div>
                <div
                  className="text-lg"
                  style={{ color: "#9CA3AF" }}
                >
                  Average Score
                </div>
              </CardContent>
            </Card>

            <Card
              className="border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
              }}
            >
              <CardContent className="p-4 text-center">
                <div
                  className="text-3xl mb-1"
                  style={{ color: "#10B981" }}
                >
                  {summary.excellentScores}
                </div>
                <div
                  className="text-lg"
                  style={{ color: "#9CA3AF" }}
                >
                  Excellent Scores (above 80%)
                </div>
              </CardContent>
            </Card>

            <Card
              className="border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl text-white mb-1">
                  {summary.differentRoles}
                </div>
                <div
                  className="text-lg"
                  style={{ color: "#9CA3AF" }}
                >
                  Different Roles
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Container */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
            }}
          >
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: "#374151" }}
                    >
                      <th
                        className="px-6 py-4 text-center cursor-pointer transition-colors duration-200"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(55, 65, 81, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                        onClick={() => handleSort("start_time")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <Calendar className="h-4 w-4" />
                          <span>Date</span>
                          <SortIcon column="start_time" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer transition-colors duration-200"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(55, 65, 81, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                        onClick={() => handleSort("interview_mode")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <FileText className="h-4 w-4" />
                          <span>Mode</span>
                          <SortIcon column="interview_mode" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer transition-colors duration-200"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <div className="flex items-center justify-center space-x-2 text-white">
                          <HelpCircle className="h-4 w-4" />
                          <span>Questions</span>
                        </div>
                      </th>

                      <th
                        className="px-6 py-4 text-center cursor-pointer transition-colors duration-200"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(55, 65, 81, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                        onClick={() => handleSort("total_score")}
                      >
                        <div className="flex items-center justify-center space-x-2 text-white">
                          <Trophy className="h-4 w-4" />
                          <span>Score</span>
                          <SortIcon column="total_score" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer transition-colors duration-200"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(55, 65, 81, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                        onClick={() => handleSort("duration")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <Clock className="h-4 w-4" />
                          <span>Duration</span>
                          <SortIcon column="duration" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-center cursor-pointer transition-colors duration-200"
                        style={{
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(55, 65, 81, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                        onClick={() => handleSort("focus_area")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <User className="h-4 w-4" />
                          <span>Role</span>
                          <SortIcon column="focus_area" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2 text-white">
                          <FileText className="h-4 w-4" />
                          <span>View Report</span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {sessions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-16 text-center"
                          style={{ color: "#9CA3AF" }}
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <HelpCircle className="h-10 w-10 text-gray-500" />
                            <p className="text-xl font-semibold">No past sessions yet</p>
                            <p className="text-base">
                              Once you complete your first mock interview, it will appear here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session, index) => (

                        <tr
                          key={session.session_id}
                          className="border-b transition-colors duration-200"
                          style={{
                            borderColor: "#374151",
                            backgroundColor:
                              index % 2 === 0
                                ? "#1E1E1E"
                                : "#2B2B2B",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(55, 65, 81, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 0
                                ? "#1E1E1E"
                                : "#2B2B2B";
                          }}
                        >
                          <td className="px-6 py-4 text-white text-center">
                            <div>
                              <div>
                                {new Date(session.start_time).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <Badge
                                className="text-base mt-1"
                                style={{
                                  backgroundColor:
                                    session.selected_difficulty === "easy"
                                      ? "#10B981"
                                      : session.selected_difficulty === "medium"
                                        ? "#F59E0B"
                                        : "#EF4444",
                                  color: "#fff",
                                }}
                              >
                                {session.selected_difficulty}
                              </Badge>
                            </div>

                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div
                                className="flex items-center justify-center space-x-2 font-semibold"
                                style={{
                                  color:
                                    session.interview_mode === "Text"
                                      ? "#10B981"
                                      : "#2563EB",
                                }}
                              >
                                {session.interview_mode === "Text" ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Mic className="h-4 w-4" />
                                )}
                                <span>{session.interview_mode}</span>
                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4 text-center">
                            <Badge
                              className="text-base px-3 py-1"
                              style={{
                                backgroundColor:
                                  session.question_source === "General"
                                    ? "#2563EB"   // blue
                                    : "#7C3AED",  // purple
                                color: "#fff",
                              }}
                            >
                              {session.question_source}
                            </Badge>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-lg">{session.total_score}/100</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < session.stars ? "⭐" : "☆"}</span>
                                ))}
                              </div>
                              <Badge
                                className="text-sm px-3 py-1"
                                style={{
                                  backgroundColor:
                                    session.score_label === "Excellent"
                                      ? "#16A34A"
                                      : session.score_label === "Good"
                                        ? "#2563EB"
                                        : session.score_label === "Average"
                                          ? "#F59E0B"
                                          : session.score_label === "Bad"
                                            ? "#EF4444"
                                            : "#7F1D1D",
                                  color: "#fff",
                                }}
                              >
                                {session.score_label}
                              </Badge>

                            </div>

                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <div>{session.duration}</div>
                              <div className="text-sm text-gray-400">
                                Prep: {session.prep_time_minutes} min
                              </div>
                            </div>

                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <div>{session.focus_area}</div>
                              <div className="text-sm" style={{ color: '#9CA3AF' }}>
                                {session.keywords.join(", ")}
                              </div>
                            </div>

                          </td>

                          <td className="px-6 py-4 text-center">
                            <Button
                              onClick={() => handleViewReport(session.session_id)}
                              style={{
                                backgroundColor: "#2563EB",
                                color: "#FFFFFF",
                                border: "1px solid #3B82F6",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                fontWeight: 600,
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Report
                            </Button>



                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-lg" style={{ color: "#9CA3AF" }}>
              💡 Click on column headers to sort • Reports are
              available to view immediately after session completion

            </p>
          </div>
        </div>
      </main>

      <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
        <DialogContent
          style={{
            backgroundColor: "#1F2937",
            borderColor: "#374151",
            color: "#fff",
            maxWidth: "650px",
          }}
        >
          <DialogHeader>
            <DialogTitle>Performance Report</DialogTitle>
          </DialogHeader>

          {reportLoading ? (
            <div className="text-center py-6">Loading report...</div>
          ) : (
            <div className="space-y-6">

              {/* NO REPORT AVAILABLE → SHOW ONLY TIPS */}
              {!reportAvailable ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-yellow-900/20 border border-yellow-600 px-4 py-3 text-yellow-300">
                    No performance report available yet, but here are some useful tips.
                  </div>

                  <div>
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(234, 179, 8, 0.15)", // yellow tint
                        border: "1px solid rgba(250, 204, 21, 0.4)",
                        color: "#FDE68A", // yellow text
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      <Lightbulb size={20} color="#FACC15" />
                      Interview Tips
                    </h3>

                    <ul className="list-disc ml-6 space-y-1 text-gray-200">
                      {tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  {/* STRENGTHS */}
                  <div>
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(22, 163, 74, 0.15)", // green tint
                        border: "1px solid rgba(34, 197, 94, 0.4)",
                        color: "#86EFAC", // green text
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle size={20} color="#4ADE80" />
                      Strengths
                    </h3>

                    {reportData.strengths.length === 0 ? (
                      <p className="italic text-gray-400">
                        No strengths available for this session.
                      </p>
                    ) : (
                      <ul className="list-disc ml-6 space-y-1 text-gray-200">
                        {reportData.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* WEAKNESSES */}
                  <div>
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(220, 38, 38, 0.15)", // red tint
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        color: "#FCA5A5", // red text
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      <XCircle size={20} color="#F87171" />
                      Weaknesses
                    </h3>



                    {reportData.weaknesses.length === 0 ? (
                      <p className="italic text-gray-400">
                        No weaknesses available for this session.
                      </p>
                    ) : (
                      <ul className="list-disc ml-6 space-y-1 text-gray-200">
                        {reportData.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* TIPS */}
                  <div>
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(234, 179, 8, 0.15)", // yellow tint
                        border: "1px solid rgba(250, 204, 21, 0.4)",
                        color: "#FDE68A", // yellow text
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      <Lightbulb size={20} color="#FACC15" />
                      Interview Tips
                    </h3>


                    <ul className="list-disc ml-6 space-y-1 text-gray-200">
                      {tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>

      </Dialog>


    </div>
  );
}
