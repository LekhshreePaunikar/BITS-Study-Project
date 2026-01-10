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
  Users
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
          const imageUrl = `http://localhost:3001${res.data.profileImage}?t=${new Date().getTime()}`;
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
  });

  useEffect(() => {
    const fetchUserKPIs = async () => {
      try {
        const res = await api.get("/user/kpis");

        setUserStats({
          totalSessions: res.data.total_sessions,
          averageScore: res.data.average_score,
          hoursCompleted: res.data.hours_completed,
          improvementRate: res.data.improvement_rate,
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

            <Button variant="outline" onClick={onLogout}
              className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              style={{ borderColor: '#DC2626', color: 'white', backgroundColor: 'rgba(127, 29, 29, 0.3)' }}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>

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
              <p
                className="text-base flex items-center"
                style={{ color: '#10B981' }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 from last month
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
              <p
                className="text-base flex items-center"
                style={{ color: '#10B981' }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% from last month
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
              <p
                className="text-base flex items-center"
                style={{ color: '#10B981' }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +3h from last month
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
                +{userStats.improvementRate}%
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
                <Play className="h-5 w-5" style={{ color: '#3B82F6' }} />
                <span>Start Interview</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Begin a new mock interview session with AI-powered questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
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
                <BarChart3 className="h-5 w-5" style={{ color: '#3B82F6' }} />
                <span>Performance Report</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                View detailed analytics and insights on your interview performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
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
                <History className="h-5 w-5" style={{ color: '#3B82F6' }} />
                <span>Past Sessions</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Review your previous interview sessions and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
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
                <HelpCircle className="h-5 w-5" style={{ color: '#3B82F6' }} />
                <span>Help &amp; Support</span>
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Get help with the platform or contact our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
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
                <Target className="h-5 w-5" />
                <span>Performance Highlights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Last Session Score</span>
                  <span
                    className="text-lg text-white"
                  >
                    {userStats.lastScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Practice Streak</span>
                  <span
                    className="text-lg"
                    style={{ color: '#10B981' }}
                  >
                    {userStats.streakDays} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Completion Rate</span>
                  <span
                    className="text-lg text-white"
                  >
                    {userStats.completionRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Total Questions</span>
                  <span className="text-lg text-white">{userStats.totalQuestions}</span>
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
                <Lightbulb className="h-5 w-5" />
                <span>Quick Tips</span>
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
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Privacy
              </button>

              <span style={{ color: "#374151" }}>|</span>

              <button
                style={{ color: "#6B7280" }}
                onClick={() => setOpenPolicyModal("terms")}
                className="transition-colors duration-200"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Terms
              </button>

              <span style={{ color: "#374151" }}>|</span>

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