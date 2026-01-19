// root/src/components/PerformanceReport.tsx

import { useState, useEffect } from "react";
import api from "../utils/api";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  Award,
  Star,
  Lightbulb,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

interface PerformanceReportProps {
  username: string;
  onBackToDashboard: () => void;
}

export default function PerformanceReport({
  username,
  onBackToDashboard,
}: PerformanceReportProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH REAL DATA ================= */
  useEffect(() => {
    api
      .get("/performance/summary")
      .then((res: any) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading performance report...
      </div>
    );
  }
  const toPercent = (score = 0) => {
    if (score > 10) return Math.round(score); // already %
    return Math.round((score / 10) * 100);
  };
  /* ================= SUMMARY ================= */
  const totalSessions = data.summary.total_sessions;
  const averageScore = toPercent(data.summary.avg_score);
  const bestScore = toPercent(data.summary.best_score);
  const lowestScore = toPercent(data.summary.lowest_score);

  // const scoreOverTimeData = data.scoreOverTime || [];
  const scoreOverTimeData =
    data.scoreOverTime?.length
      ? data.scoreOverTime
      : [{ date: "Today", score: averageScore }];

  const rawImprovement =
    scoreOverTimeData.length >= 2 &&
      scoreOverTimeData[0].score > 0
      ? ((scoreOverTimeData.at(-1).score -
        scoreOverTimeData[0].score) /
        scoreOverTimeData[0].score) *
      100
      : 0;



  const scores = scoreOverTimeData.map(d => d.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const improvement =
    avg > 0
      ? Math.max(
        0,
        Number((((scores.at(-1) - avg) / avg) * 100).toFixed(1))
      )
      : 0;





  /* ================= DISTRIBUTIONS ================= */
  const levelDistribution = {
    easy: data.difficulty.easy || 0,
    medium: data.difficulty.medium || 0,
    hard: data.difficulty.hard || 0,
  };

  const skillPerformanceData = [
    {
      skill: "Communication",
      easy: data.skills.communication,
      medium: data.skills.communication - 2,
      hard: data.skills.communication - 4,
    },

    {
      skill: "Technical Skills",
      easy: data.skills.technical,
      medium: data.skills.technical - 2,
      hard: data.skills.technical - 4,
    },
  ];

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);


  const questionTypeData = [
    { name: "Text Mode", value: data.mode.text || 0, color: "#10B981" },
    { name: "Voice Mode", value: data.mode.voice || 0, color: "#3B82F6" },
  ];

  /* ================= STRENGTHS / WEAKNESSES ================= */
  const strengths = (data.strengths || []).slice(0, 4);
  const weaknesses = (data.weaknesses || []).slice(0, 4);
  // const strengths = (data.strengths || []).map((t: string) => ({
  //   skill: "Strength",
  //   tip: t,
  // }));

  // const weaknesses = (data.weaknesses || []).map((t: string) => ({
  //   skill: "Improvement",
  //   tip: t,
  // }));

  /* ================= METRICS ================= */
  const evaluationMetrics = {
    avgResponseTime: `${Math.round(data.avgTimePerQuestion || 120)} sec`,
    avgEvaluationTime: "1 min",
    consistencyScore: data.consistencyScore || 85,
  };

  /* ================= HELPERS ================= */
  const getMetricColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good) return "#10B981";
    if (value >= thresholds.warning) return "#F59E0B";
    return "#EF4444";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div
          className="rounded-lg p-3 shadow-lg border"
          style={{
            backgroundColor: "#1F2937",
            borderColor: "#374151",
            color: "#FFFFFF",
          }}
        >
          <p className="text-sm mb-2" style={{ color: "#9CA3AF" }}>
            {label}
          </p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === "score" && "/100"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  let bannerMessage = "";

  if (!scoreOverTimeData || scoreOverTimeData.length < 2) {
    bannerMessage = "This is your first benchmark session. Keep going! 🚀";
  } else if (Number(improvement) > 0) {
    bannerMessage = `You've improved by ${improvement}% recently! 🎉`;
  } else {
    bannerMessage = "You're building consistency — keep practicing! 💪";
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#111827" }}>
      {/* HEADER */}
      <header
        className="border-b"
        style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
      >
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          {/* LEFT */}
          <Button
            variant="outline"
            onClick={onBackToDashboard}
            className="flex items-center space-x-2"
            style={{
              borderColor: "#6B7280",
              backgroundColor: "rgba(62,65,69,1)",
              color: "#FFFFFF",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>

          {/* CENTER */}
          <div className="text-center absolute left-1/2 -translate-x-1/2">
            <h1 className="text-2xl md:text-3xl text-white">
              Performance Report
            </h1>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              Overall Performance Analysis
            </p>
          </div>

          {/* RIGHT (empty spacer to balance flex) */}
          <div style={{ width: 160 }} />
        </div>
      </header>
      {/* MAIN */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* BANNER */}
        <Card
          className="border-0 text-white"
          style={{
            background:
              "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)",
          }}
        >
          <CardContent className="p-6 text-center animate-pulse">
            <Award className="h-8 w-8 mx-auto mb-2" />
            <h2 className="text-xl">🎉 Congratulations, {username}!</h2>
            <p className="text-lg">
              {bannerMessage}
            </p>
          </CardContent>
        </Card>

        {/* ===== REST OF YOUR UI IS UNCHANGED ===== */}
        {/* Cards, charts, pies, strengths, weaknesses, metrics */}
        {/* Everything below uses the same JSX you already had */}
        {/* ================= SCORE SUMMARY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border" style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}>
            <CardHeader>
              <CardTitle style={{ color: "#9CA3AF" }}>Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-white">{totalSessions}</div>
            </CardContent>
          </Card>

          <Card className="border" style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}>
            <CardHeader>
              <CardTitle style={{ color: "#9CA3AF" }}>Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-400">{averageScore}%</div>
            </CardContent>
          </Card>

          <Card className="border" style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}>
            <CardHeader>
              <CardTitle style={{ color: "#9CA3AF" }}>Best Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-400">{bestScore}%</div>
            </CardContent>
          </Card>

          <Card className="border" style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}>
            <CardHeader>
              <CardTitle style={{ color: "#9CA3AF" }}>Lowest Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-red-400">{lowestScore}%</div>
            </CardContent>
          </Card>
        </div>
        {/* ================= LEVEL DISTRIBUTION ================= */}
        <Card
          className="border"
          style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "#9CA3AF" }}>Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Badge style={{ backgroundColor: "#10B981", color: "#fff" }}>
              easy: {levelDistribution.easy}
            </Badge>
            <Badge style={{ backgroundColor: "#F59E0B", color: "#fff" }}>
              medium: {levelDistribution.medium}
            </Badge>
            <Badge style={{ backgroundColor: "#EF4444", color: "#fff" }}>
              hard: {levelDistribution.hard}
            </Badge>
          </CardContent>
        </Card>
        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LINE CHART */}
          <Card
            className="border"
            style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#9CA3AF" }}>
                Score Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* BAR CHART */}
          <Card
            className="border"
            style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#9CA3AF" }}>
                Skill-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="skill" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="easy" fill="#10B981" />
                  <Bar dataKey="medium" fill="#F59E0B" />
                  <Bar dataKey="hard" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        {/* ================= INTERVIEW MODE ================= */}
        <Card
          className="border"
          style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "#9CA3AF" }}>
              Interview Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={questionTypeData}
                  dataKey="value"
                  outerRadius={65}
                  innerRadius={35}
                  labelLine={false}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                >
                  {questionTypeData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* ================= STRENGTHS & WEAKNESSES ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* STRENGTHS */}
          <Card
            className="border"
            style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#10B981" }}>
                Top Strengths
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                What you consistently did well
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {strengths.length ? (
                strengths.map((s: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2"
                  >
                    <Star className="h-4 w-4 mt-1 text-green-400 shrink-0" />
                    <p
                      className="text-sm font-medium leading-relaxed"
                      style={{ color: "#D1FAE5" }} // soft green
                    >
                      {capitalize(s)}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: "#9CA3AF" }}>
                  No strengths identified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* WEAKNESSES */}
          <Card
            className="border"
            style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "#F59E0B" }}>
                Areas for Improvement
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                What to focus on next
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {weaknesses.length ? (
                weaknesses.map((w: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 mt-1 text-yellow-400 shrink-0" />
                    <p
                      className="text-sm font-medium leading-relaxed"
                      style={{ color: "#FDE68A" }} // soft amber
                    >
                      {capitalize(w)}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: "#9CA3AF" }}>
                  No major improvement areas detected.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ================= EVALUATION METRICS ================= */}
        <Card
          className="border"
          style={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "#9CA3AF" }}>
              Evaluation Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Clock className="mx-auto mb-2" color="#3B82F6" />
              <p className="text-white">{evaluationMetrics.avgResponseTime}</p>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                Avg Response Time
              </p>
            </div>

            <div>
              <Target className="mx-auto mb-2" color="#10B981" />
              <p className="text-white">{evaluationMetrics.avgEvaluationTime}</p>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                Avg Evaluation Time
              </p>
            </div>

            <div>
              <TrendingUp className="mx-auto mb-2" color="#8B5CF6" />
              <p
                className="text-white"
                style={{
                  color: getMetricColor(evaluationMetrics.consistencyScore, {
                    good: 80,
                    warning: 60,
                  }),
                }}
              >
                {evaluationMetrics.consistencyScore}%
              </p>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                Consistency Score
              </p>
            </div>
          </CardContent>
        </Card>



      </main>
    </div>
  );
}
