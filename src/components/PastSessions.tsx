// root/src/components/PastSessions.tsx

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Download,
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  User,
  ChevronUp,
  ChevronDown,
  FileText,
  Mic,
} from "lucide-react";

interface PastSessionsProps {
  username: string;
  onBackToDashboard: () => void;
}

interface SessionRecord {
  id: string;
  date: string;
  mode: "Text" | "Voice";
  score: number;
  duration: string;
  role: string;
  level: string;
  questionsAnswered: number;
}

export default function PastSessions({
  username,
  onBackToDashboard,
}: PastSessionsProps) {
  const [sortColumn, setSortColumn] = useState<
    keyof SessionRecord | null
  >(null);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc"
  >("desc");

  // Mock session data
  const generateSessionData = (): SessionRecord[] => {
    const roles = [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Cloud Engineer",
      "Data Analyst",
      "Product Manager",
    ];
    const levels = ["Beginner", "Intermediate", "Advanced"];
    const modes: ("Text" | "Voice")[] = ["Text", "Voice"];

    const sessions: SessionRecord[] = [];

    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(
        date.getDate() - i * 2 - Math.floor(Math.random() * 7),
      );

      sessions.push({
        id: `session-${i + 1}`,
        date: date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        mode: modes[Math.floor(Math.random() * modes.length)],
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        duration: `${String(Math.floor(Math.random() * 45) + 15).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        level:
          levels[Math.floor(Math.random() * levels.length)],
        questionsAnswered: Math.floor(Math.random() * 6) + 5, // 5-10 questions
      });
    }

    return sessions.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  const [sessions, setSessions] = useState<SessionRecord[]>(
    generateSessionData,
  );

  const handleSort = (column: keyof SessionRecord) => {
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
      if (column === "date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
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

  const handleDownloadReport = (sessionId: string) => {
    console.log(`Downloading report for session ${sessionId}`);
    // Mock download functionality
    alert(`Downloading PDF report for session ${sessionId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "#10B981";
    if (score >= 70) return "#F59E0B";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreBadgeVariant = (
    score: number,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const SortIcon = ({
    column,
  }: {
    column: keyof SessionRecord;
  }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#111827" }}
    >
      {/* Header */}
      <header className="border-b" style={{backgroundColor: '#1F2937',  borderColor: '#374151',}}>
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
                <div className="text-2xl text-white mb-1">
                  {sessions.length}
                </div>
                <div
                  className="text-sm"
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
                  className="text-2xl mb-1"
                  style={{
                    color: getScoreColor(
                      Math.round(
                        sessions.reduce(
                          (sum, s) => sum + s.score,
                          0,
                        ) / sessions.length,
                      ),
                    ),
                  }}
                >
                  {Math.round(
                    sessions.reduce(
                      (sum, s) => sum + s.score,
                      0,
                    ) / sessions.length,
                  )}
                  %
                </div>
                <div
                  className="text-sm"
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
                  className="text-2xl mb-1"
                  style={{ color: "#10B981" }}
                >
                  {sessions.filter((s) => s.score >= 85).length}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  Excellent Scores
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
                <div className="text-2xl text-white mb-1">
                  {new Set(sessions.map((s) => s.role)).size}
                </div>
                <div
                  className="text-sm"
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
                        className="px-6 py-4 text-left cursor-pointer transition-colors duration-200"
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
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <Calendar className="h-4 w-4" />
                          <span>Date</span>
                          <SortIcon column="date" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left cursor-pointer transition-colors duration-200"
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
                        onClick={() => handleSort("mode")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <FileText className="h-4 w-4" />
                          <span>Mode</span>
                          <SortIcon column="mode" />
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
                        onClick={() => handleSort("score")}
                      >
                        <div className="flex items-center justify-center space-x-2 text-white">
                          <Target className="h-4 w-4" />
                          <span>Score</span>
                          <SortIcon column="score" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left cursor-pointer transition-colors duration-200"
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
                        className="px-6 py-4 text-left cursor-pointer transition-colors duration-200"
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
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center space-x-2 text-white">
                          <User className="h-4 w-4" />
                          <span>Role</span>
                          <SortIcon column="role" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2 text-white">
                          <Download className="h-4 w-4" />
                          <span>View Report</span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {sessions.map((session, index) => (
                      <tr
                        key={session.id}
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
                        <td className="px-6 py-4 text-white">
                          <div>
                            <div>{session.date}</div>
                            <Badge
                              variant="outline"
                              className="text-xs mt-1"
                              style={{
                                borderColor: "#6B7280",
                                color: "#9CA3AF",
                                backgroundColor: "transparent",
                              }}
                            >
                              {session.level}
                            </Badge>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {session.mode === "Text" ? (
                              <FileText
                                className="h-4 w-4"
                                style={{ color: "#3B82F6" }}
                              />
                            ) : (
                              <Mic
                                className="h-4 w-4"
                                style={{ color: "#8B5CF6" }}
                              />
                            )}
                            <span className="text-white">
                              {session.mode}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span
                              className="text-lg"
                              style={{
                                color: getScoreColor(
                                  session.score,
                                ),
                              }}
                            >
                              {session.score}/100
                            </span>
                            <Badge
                              className="text-xs text-white"
                              style={{
                                backgroundColor:
                                  session.score >= 85
                                    ? "#10B981"
                                    : session.score >= 70
                                      ? "#F59E0B"
                                      : "#EF4444",
                              }}
                            >
                              {session.score >= 85
                                ? "Excellent"
                                : session.score >= 70
                                  ? "Good"
                                  : "Fair"}
                            </Badge>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-white">
                            <div>{session.duration}</div>
                            <div
                              className="text-xs"
                              style={{ color: "#9CA3AF" }}
                            >
                              {session.questionsAnswered}{" "}
                              questions
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-white">
                            <div
                              className="max-w-[150px] truncate"
                              title={session.role}
                            >
                              {session.role}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDownloadReport(session.id)
                            }
                            className="rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 text-white"
                            style={{
                              backgroundColor: "#10B981",
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download Report</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              💡 Click on column headers to sort • Reports are
              available for download immediately after session
              completion
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
