// root/src/components/Dashboard.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import api from "../utils/api";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Play,
  BarChart3,
  History,
  HelpCircle,
  LogOut,
  Calendar,
  Target,
  Clock,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Users,
  Flame,
  PenLine,
  Award,
  CheckCircle,
  ListChecks,
  MessageSquare,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DashboardProps {
  username: string;
  onLogout: () => void;
  onProfileClick: () => void;
  onStartInterview: () => void;
  onViewPastSessions?: () => void;
  onViewPerformanceReport?: () => void;
  onGetHelp?: () => void;
}


export default function Dashboard({ username, onLogout, onProfileClick, onStartInterview, onViewPastSessions, onViewPerformanceReport, onGetHelp }: DashboardProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardProfile = async () => {
      try {
        const res = await api.get('/user'); // Backend se data mangwayein
        if (res.data.profileImage) {
          // Timestamp (?t=...) add karne se browser hamesha nayi image download karega
          const imageUrl = `${API_BASE_URL}${res.data.profileImage}?t=${new Date().getTime()}`;
          setProfileImage(imageUrl);

          // Optional: LocalStorage mein bhi save kar sakte hain instant access ke liye
          localStorage.setItem('userPhoto', imageUrl);
        }
      } catch (err) {
        console.error('Header image fetch error:', err);
      }
    };

    fetchDashboardProfile();
  }, []);


  // user data with enhanced metrics
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    hoursCompleted: 0,
    improvementRate: 0,

    deltaSessions: 0,
    deltaScore: 0,
    deltaHours: 0,

    lastSessionScore: 0,
    bestScore: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    completionRate: 0,
    streakDays: 0,
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserKPIs = async () => {
      try {
        const res = await api.get("/user/kpis");

        console.log("USER KPI RESPONSE:", res.data);

        setUserStats({
          totalSessions: res.data.total_sessions,
          averageScore: res.data.average_score,
          hoursCompleted: res.data.hours_completed,
          improvementRate: res.data.improvement_rate,

          deltaSessions: res.data.delta_sessions,
          deltaScore: res.data.delta_score,
          deltaHours: res.data.delta_hours,

          lastSessionScore: res.data.last_session_score,
          bestScore: res.data.best_score,
          totalQuestions: res.data.total_questions,
          totalAnswers: res.data.total_answers,
          completionRate: res.data.completion_rate,
          streakDays: res.data.streak_days,
        });


      } catch (err) {
        console.error("Failed to load user KPIs", err);
      }
    };

    fetchUserKPIs();
  }, []);



  const handleStartInterview = () => {
    onStartInterview();
  };

  const handleViewReports = () => {
    if (onViewPerformanceReport) {
      onViewPerformanceReport();
    }
  };

  const handleViewSessions = () => {
    if (onViewPastSessions) {
      onViewPastSessions();
    }
  };

  const handleHelp = () => {
    if (onGetHelp) {
      onGetHelp();
    }
  };

  const [openPolicyModal, setOpenPolicyModal] = useState<
    "privacy" | "terms" | null
  >(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      {/* Header */}
      <header
        className="border-b"
        style={{
          backgroundColor: '#1F2937',
          borderColor: '#374151'
        }}
      >

        <style>
          {`
            @keyframes streakPulse {
              0% {
                box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
              }
              50% {
                box-shadow: 0 0 16px rgba(249, 115, 22, 0.9);
              }
              100% {
                box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
              }
            }
          `}
        </style>

        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Profile and Welcome */}
            <div className="flex items-center space-x-4">
              <Avatar
                className="h-16 w-16 cursor-pointer transition-all duration-300 hover:scale-110 hover:ring-4 hover:ring-blue-500/70 hover:shadow-2xl"
                onClick={onProfileClick}
                style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.35)' }}
              >
                <AvatarImage
                  src={profileImage || undefined}
                  alt={username}
                />

                <AvatarFallback
                  className="text-white"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl mb-2 text-white">Welcome back, {username}!</h1>
                <p style={{ color: '#9CA3AF' }} className="text-sm">
                  Ready to practice your interview skills?
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">

              <div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.12)',
                  animation: 'streakPulse 4s infinite',
                  boxShadow: '0 0 12px rgba(249, 115, 22, 0.45)'
                }}
              >
                <span
                  style={{
                    color: '#FDBA74',
                    fontWeight: 600,
                    fontSize: '1.2rem'
                  }}
                >
                  {userStats.streakDays}
                </span>

                <Flame
                  size={20}
                  style={{
                    color: '#FB923C'
                  }}
                />
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: '#DC2626',
                  color: 'white',
                  backgroundColor: 'rgba(127, 29, 29, 0.3)'
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-base">Logout</span>
              </Button>

            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xl"
                style={{ color: '#9CA3AF' }}
              >
                Total Sessions
              </CardTitle>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: '#3B82F620' }} // 20% opacity
              >
                <Calendar className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>

            </CardHeader>
            <CardContent>
              <div className="text-3xl text-white mb-1">{userStats.totalSessions}</div>
              <p className="text-base flex items-center" style={{ color: '#10B981' }}>
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userStats.deltaSessions} from last period
              </p>

            </CardContent>
          </Card>

          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xl"
                style={{ color: '#9CA3AF' }}
              >
                Average Score
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#10B98120' }}>
                <Target className="h-6 w-6" style={{ color: '#10B981' }} />
              </div>

            </CardHeader>
            <CardContent>
              <div
                className="text-3xl mb-1 text-white"
              >
                {userStats.averageScore}%
              </div>
              <p className="text-base flex items-center" style={{ color: '#10B981' }}>
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userStats.deltaScore}% from last period
              </p>

            </CardContent>
          </Card>

          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xl"
                style={{ color: '#9CA3AF' }}
              >
                Hours Completed
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#F59E0B20' }}>
                <Clock className="h-6 w-6" style={{ color: '#F59E0B' }} />
              </div>

            </CardHeader>
            <CardContent>
              <div className="text-3xl text-white mb-1">{userStats.hoursCompleted}h</div>
              <p className="text-base flex items-center" style={{ color: '#10B981' }}>
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userStats.deltaHours}h from last period

              </p>

            </CardContent>
          </Card>

          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-xl"
                style={{ color: '#9CA3AF' }}
              >
                Improvement Rate
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#EF444420' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#EF4444' }} />
              </div>

            </CardHeader>
            <CardContent>
              <div
                className="text-3xl mb-1 text-white"
              >
                {userStats.improvementRate}%
              </div>
              <p
                className="text-base"
                style={{ color: '#10B981' }}
              >
                Since you started
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer border group"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={handleStartInterview}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2 text-white group-hover:text-blue-400 transition-colors"
              >
                <Play className="h-7 w-7" style={{ color: '#3B82F6' }} />
                <span className="text-xl">Start Interview</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Begin a new mock interview session with AI-powered questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="text-lg w-full transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{
                  backgroundColor: '#3B82F6',
                  borderColor: '#3B82F6'
                }}
              >
                Start New Session
              </Button>
            </CardContent>
          </Card>

          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer border group"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={handleViewReports}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2 text-white group-hover:text-blue-400 transition-colors"
              >
                <BarChart3 className="h-7 w-7" style={{ color: '#3B82F6' }} />
                <span className="text-xl">Performance Report</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                View detailed analytics and insights on your interview performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="text-lg w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  borderColor: '#3B82F6',
                  color: '#3B82F6',
                  backgroundColor: 'transparent'
                }}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer border group"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={handleViewSessions}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2 text-white group-hover:text-blue-400 transition-colors"
              >
                <History className="h-7 w-7" style={{ color: '#3B82F6' }} />
                <span className="text-xl">Past Sessions</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Review your previous interview sessions and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="text-lg w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  borderColor: '#3B82F6',
                  color: '#3B82F6',
                  backgroundColor: 'transparent'
                }}
              >
                View History
              </Button>
            </CardContent>
          </Card>

          <Card
            className="transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer border group"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={handleHelp}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2 text-white group-hover:text-blue-400 transition-colors"
              >
                <HelpCircle className="h-7 w-7" style={{ color: '#3B82F6' }} />
                <span className="text-xl">Help &amp; Support</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Get help with the platform or contact our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="text-lg w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  borderColor: '#3B82F6',
                  color: '#3B82F6',
                  backgroundColor: 'transparent'
                }}
              >
                Get Help
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card
            className="border"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2"
                style={{ color: '#9CA3AF' }}
              >
                <Target className="h-7 w-7" />
                <span className="text-lg">Performance Highlights</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Review your interview performance with key insights
              </CardDescription>
            </CardHeader>
            <CardContent>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Last Session Score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(59,130,246,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Target size={20} color="#60A5FA" />
                    </div>
                    <span style={{ color: "#FFFFFF" }}>Last Session Score</span>
                  </div>
                  <span style={{ color: "#FFFFFF", fontSize: 18 }}>
                    {userStats.lastSessionScore}%
                  </span>
                </div>

                {/* Practice Streak */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(249,115,22,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Flame size={20} color="#FB923C" />
                    </div>
                    <span style={{ color: "#FFFFFF" }}>Practice Streak</span>
                  </div>
                  <span style={{ color: "#FB923C", fontSize: 18, fontWeight: 600 }}>
                    {userStats.streakDays} days
                  </span>
                </div>

                {/* Completion Rate */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(16,185,129,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle size={20} color="#34D399" />
                    </div>
                    <span style={{ color: "#FFFFFF" }}>Completion Rate</span>
                  </div>
                  <span style={{ color: "#FFFFFF", fontSize: 18 }}>
                    {userStats.completionRate}%
                  </span>
                </div>

                {/* Total Questions Attempted */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(168,85,247,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ListChecks size={20} color="#C084FC" />
                    </div>
                    <span style={{ color: "#FFFFFF" }}>Total Questions Available</span>
                  </div>
                  <span style={{ color: "#FFFFFF", fontSize: 18 }}>
                    {userStats.totalQuestions}
                  </span>
                </div>

                {/* Total Answers Given */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(34,211,238,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PenLine size={20} color="#67E8F9" />
                    </div>
                    <span style={{ color: "#FFFFFF" }}>Total Answers Given</span>
                  </div>
                  <span style={{ color: "#FFFFFF", fontSize: 18 }}>
                    {userStats.totalAnswers}
                  </span>
                </div>

                {/* Best Score So Far */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(250,204,21,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Award size={20} color="#FACC15" />
                    </div>
                    <span style={{ color: "#FFFFFF" }}>Best Score So Far</span>
                  </div>
                  <span style={{ color: "#FFFFFF", fontSize: 18 }}>
                    {userStats.bestScore}%
                  </span>
                </div>

              </div>


            </CardContent>
          </Card>

          {/* Quick Tips Section */}
          <Card
            className="border"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader>
              <CardTitle
                className="flex items-center space-x-2"
                style={{ color: '#9CA3AF' }}
              >
                <Lightbulb className="h-7 w-7" />
                <span className="text-lg">Quick Tips</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Improve your interview skills with these recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#374151' }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#3B82F620' }}>
                    <BookOpen className="h-6 w-6 mt-1" style={{ color: '#3B82F6' }} />
                  </div>

                  <div>
                    <h4 className="text-white text-base">Practice Regularly</h4>
                    <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                      Aim for 2-3 sessions per week to build confidence
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#374151' }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#10B98120' }}>
                    <BarChart3 className="h-6 w-6" style={{ color: '#10B981' }} />
                  </div>

                  <div>
                    <h4 className="text-white text-base">Review Feedback</h4>
                    <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                      Study your performance reports to identify areas for improvement
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#374151' }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#F59E0B20' }}>
                    <Users className="h-6 w-6" style={{ color: '#F59E0B' }} />
                  </div>

                  <div>
                    <h4 className="text-white text-base">Stay Updated</h4>
                    <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                      Keep practicing with new question types and scenarios
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#374151' }}
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#8B5CF620' }}>
                    <MessageSquare className="h-6 w-6" style={{ color: '#8B5CF6' }} />
                  </div>

                  <div>
                    <h4 className="text-white text-base">Answer Out Loud</h4>
                    <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                      Practicing spoken answers improves clarity, confidence, and response flow
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer
        className="border-t mt-16"
        style={{
          backgroundColor: "#111827",
          borderColor: "#1F2937",
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-1">
              <span style={{ color: "#6B7280" }}>Version:</span>
              <span className="text-white">1.2.5</span>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <button
                style={{ color: "#6B7280" }}
                onClick={() => setOpenPolicyModal("privacy")}
                className="transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Privacy
              </button>

              <span style={{ color: '#6B7280', cursor: 'pointer' }}>|</span>

              <button
                onClick={() => setOpenPolicyModal("terms")}
                className="transition-colors duration-200"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Terms
              </button>

        

              <div className="flex items-center space-x-2">
                <span style={{ color: "#6B7280" }}>Last Synced:</span>
                <span className="text-white">Just now</span>
                <div
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#10B981" }}
                />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={!!openPolicyModal} onOpenChange={() => setOpenPolicyModal(null)}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            boxShadow: "0 30px 70px rgba(0,0,0,0.75)",
            color: "#E5E7EB",
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {openPolicyModal === "privacy"
                ? "Privacy Policy"
                : "Terms & Conditions"}
            </DialogTitle>
          </DialogHeader>

          <div className="text-base space-y-4 leading-relaxed text-gray-300">
            {openPolicyModal === "privacy" && (
              <>
                <p>
                  This AI-Powered Mock Interview Platform respects your privacy and is
                  committed to protecting your personal information.
                </p>

                <p>
                  We collect interview responses, performance metrics, session data,
                  and account details solely to improve learning outcomes and system
                  accuracy.
                </p>

                <p>
                  Your data is processed securely using AI models and is never sold or
                  shared with third parties for marketing purposes.
                </p>

                <p>
                  By using this platform, you consent to the collection and processing
                  of data as outlined above.
                </p>
              </>
            )}

            {openPolicyModal === "terms" && (
              <>
                <p>
                  By using this AI-Powered Mock Interview Platform, you agree to these
                  Terms and Conditions.
                </p>

                <p>
                  This platform is intended solely for educational and preparation
                  purposes. AI-generated feedback does not guarantee interview or
                  employment outcomes.
                </p>

                <p>
                  Users must not misuse the system, submit harmful content, or attempt
                  to manipulate or reverse-engineer platform behavior.
                </p>

                <p>
                  We reserve the right to modify or discontinue the service at any
                  time without prior notice.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}