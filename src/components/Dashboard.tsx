// root/src/components/Dashboard.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
  // Mock user data with enhanced metrics
  const userStats = {
    totalSessions: 24,
    averageScore: 85,
    hoursCompleted: 18,
    improvementRate: 12,
    lastScore: 92,
    streakDays: 7,
    totalQuestions: 156,
    completionRate: 94
  };

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

  // Helper function to get metric color based on value
  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'averageScore':
        return value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444';
      case 'improvementRate':
        return value > 0 ? '#10B981' : value === 0 ? '#F59E0B' : '#EF4444';
      case 'completionRate':
        return value >= 90 ? '#10B981' : value >= 70 ? '#F59E0B' : '#EF4444';
      default:
        return '#10B981';
    }
  };

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
                className="h-12 w-12 cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-500/50 hover:shadow-lg"
                onClick={onProfileClick}
                style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' }}
              >
                <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80`} alt={username} />
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
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Total Sessions
              </CardTitle>
              <Calendar className="h-4 w-4" style={{ color: '#6B7280' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white mb-1">{userStats.totalSessions}</div>
              <p
                className="text-xs flex items-center"
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
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Average Score
              </CardTitle>
              <Target className="h-4 w-4" style={{ color: '#6B7280' }} />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl mb-1"
                style={{ color: getMetricColor('averageScore', userStats.averageScore) }}
              >
                {userStats.averageScore}%
              </div>
              <p
                className="text-xs flex items-center"
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
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Hours Completed
              </CardTitle>
              <Clock className="h-4 w-4" style={{ color: '#6B7280' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white mb-1">{userStats.hoursCompleted}h</div>
              <p
                className="text-xs flex items-center"
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
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Improvement Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#6B7280' }} />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl mb-1"
                style={{ color: getMetricColor('improvementRate', userStats.improvementRate) }}
              >
                +{userStats.improvementRate}%
              </div>
              <p
                className="text-xs"
                style={{ color: '#9CA3AF' }}
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
                    className="text-lg"
                    style={{ color: getMetricColor('averageScore', userStats.lastScore) }}
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
                    className="text-lg"
                    style={{ color: getMetricColor('completionRate', userStats.completionRate) }}
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
                  <BookOpen className="h-4 w-4 mt-1" style={{ color: '#3B82F6' }} />
                  <div>
                    <h4 className="text-white text-sm">Practice Regularly</h4>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      Aim for 2-3 sessions per week to build confidence
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#374151' }}
                >
                  <BarChart3 className="h-4 w-4 mt-1" style={{ color: '#10B981' }} />
                  <div>
                    <h4 className="text-white text-sm">Review Feedback</h4>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      Study your performance reports to identify areas for improvement
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:shadow-md"
                  style={{ backgroundColor: '#374151' }}
                >
                  <Users className="h-4 w-4 mt-1" style={{ color: '#F59E0B' }} />
                  <div>
                    <h4 className="text-white text-sm">Stay Updated</h4>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      Keep practicing with new question types and scenarios
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}