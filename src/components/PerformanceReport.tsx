// root/src/components/PerformanceReport.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
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
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  Award,
  Filter,
  Star,
  Lightbulb,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface PerformanceReportProps {
  username: string;
  onBackToDashboard: () => void;
}

export default function PerformanceReport({ username, onBackToDashboard }: PerformanceReportProps) {
  const [dateRange, setDateRange] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [mode, setMode] = useState('all');

  // Mock data generation
  const generateScoreOverTimeData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 7);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.floor(Math.random() * 30) + 60 + (i * 2), // Trending upward
        mode: i % 2 === 0 ? 'Text' : 'Voice',
        difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
        duration: `${Math.floor(Math.random() * 20) + 15}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      });
    }
    return data;
  };

  const generateSkillPerformanceData = () => [
    { skill: 'Communication', easy: 88, medium: 82, hard: 75 },
    { skill: 'Problem Solving', easy: 92, medium: 85, hard: 78 },
    { skill: 'Technical Skills', easy: 85, medium: 80, hard: 82 },
    { skill: 'Leadership', easy: 90, medium: 87, hard: 80 },
    { skill: 'Creativity', easy: 86, medium: 78, hard: 72 },
    { skill: 'Time Management', easy: 89, medium: 83, hard: 77 }
  ];

  const generateQuestionTypeData = () => [
    { name: 'Text Mode', value: 60, color: '#10B981' },
    { name: 'Voice Mode', value: 40, color: '#3B82F6' },
    { name: 'Pre-defined', value: 70, color: '#F59E0B' },
    { name: 'Resume-based', value: 30, color: '#8B5CF6' }
  ];

  const scoreOverTimeData = generateScoreOverTimeData();
  const skillPerformanceData = generateSkillPerformanceData();
  const questionTypeData = generateQuestionTypeData();

  // Summary statistics
  const totalSessions = 24;
  const averageScore = Math.round(scoreOverTimeData.reduce((sum, item) => sum + item.score, 0) / scoreOverTimeData.length);
  const bestScore = Math.max(...scoreOverTimeData.map(item => item.score));
  const lowestScore = Math.min(...scoreOverTimeData.map(item => item.score));
  const improvement = ((scoreOverTimeData[scoreOverTimeData.length - 1].score - scoreOverTimeData[0].score) / scoreOverTimeData[0].score * 100).toFixed(1);

  // Level distribution
  const levelDistribution = { beginner: 8, intermediate: 10, advanced: 6 };

  // Strengths and weaknesses
  const strengths = [
    { skill: 'Problem Solving', score: 92, tip: 'Continue practicing complex scenarios to maintain this strength' },
    { skill: 'Leadership', score: 90, tip: 'Share more specific examples of team leadership experiences' },
    { skill: 'Time Management', score: 89, tip: 'Your structured approach to answering questions is excellent' }
  ];

  const weaknesses = [
    { skill: 'Creativity', score: 72, tip: 'Try to provide more innovative solutions and think outside the box' },
    { skill: 'Technical Skills', score: 78, tip: 'Focus on staying updated with latest technologies and frameworks' },
    { skill: 'Communication', score: 80, tip: 'Practice explaining complex topics in simpler terms' }
  ];

  // Evaluation metrics
  const evaluationMetrics = {
    avgResponseTime: '2.3 min',
    avgEvaluationTime: '45 sec',
    consistencyScore: 85
  };

  const handleDownloadReport = () => {
    console.log('Downloading performance report...');
    alert('Performance report PDF will be downloaded');
  };

  // Helper function to get metric color based on value
  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return '#10B981';
    if (value >= thresholds.warning) return '#F59E0B';
    return '#EF4444';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-lg p-3 shadow-lg border"
          style={{ 
            backgroundColor: '#1F2937',
            borderColor: '#374151',
            color: '#FFFFFF'
          }}
        >
          <p className="text-sm mb-2" style={{ color: '#9CA3AF' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'score' && '/100'}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl tracking-wide"
              style={{ color: '#9CA3AF' }}
            >
              PERFORMANCE REPORT
            </h1>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleDownloadReport}
                className="text-white flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: '#10B981' }}
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  borderColor: '#6B7280',
                  color: '#9CA3AF',
                  backgroundColor: 'transparent'
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Motivational Banner */}
          <Card 
            className="border-0 text-white transition-all duration-200 hover:shadow-xl"
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="animate-pulse">
                <Award className="h-8 w-8 mx-auto mb-2" />
                <h2 className="text-xl mb-2">🎉 Congratulations, {username}!</h2>
                <p className="text-lg">You've improved by {improvement}% since your first session!</p>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle 
                className="flex items-center space-x-2"
                style={{ color: '#9CA3AF' }}
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    Date Range
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger 
                      className="text-white transition-all duration-200 hover:shadow-md"
                      style={{ 
                        backgroundColor: '#3B82F6',
                        borderColor: '#3B82F6'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    Difficulty
                  </label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger 
                      className="text-white transition-all duration-200 hover:shadow-md"
                      style={{ 
                        backgroundColor: '#3B82F6',
                        borderColor: '#3B82F6'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    Mode
                  </label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger 
                      className="text-white transition-all duration-200 hover:shadow-md"
                      style={{ 
                        backgroundColor: '#3B82F6',
                        borderColor: '#3B82F6'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="voice">Voice Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle 
                  className="text-sm flex items-center space-x-2"
                  style={{ color: '#9CA3AF' }}
                >
                  <Calendar className="h-4 w-4" style={{ color: '#3B82F6' }} />
                  <span>Total Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-white mb-2">{totalSessions}</div>
                <div 
                  className="text-sm flex items-center"
                  style={{ color: '#10B981' }}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 this month
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle 
                  className="text-sm flex items-center space-x-2"
                  style={{ color: '#9CA3AF' }}
                >
                  <Target className="h-4 w-4" style={{ color: '#10B981' }} />
                  <span>Average Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-3xl mb-2"
                  style={{ color: getMetricColor(averageScore, { good: 80, warning: 60 }) }}
                >
                  {averageScore}/100
                </div>
                <div 
                  className="text-sm flex items-center"
                  style={{ color: '#10B981' }}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{improvement}% improvement
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle 
                  className="text-sm flex items-center space-x-2"
                  style={{ color: '#9CA3AF' }}
                >
                  <Award className="h-4 w-4" style={{ color: '#F59E0B' }} />
                  <span>Best Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-3xl mb-2"
                  style={{ color: '#10B981' }}
                >
                  {bestScore}/100
                </div>
                <div 
                  className="text-sm"
                  style={{ color: '#F59E0B' }}
                >
                  Personal best!
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle 
                  className="text-sm flex items-center space-x-2"
                  style={{ color: '#9CA3AF' }}
                >
                  <TrendingDown className="h-4 w-4" style={{ color: '#EF4444' }} />
                  <span>Lowest Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-3xl mb-2"
                  style={{ color: getMetricColor(lowestScore, { good: 80, warning: 60 }) }}
                >
                  {lowestScore}/100
                </div>
                <div 
                  className="text-sm"
                  style={{ color: '#9CA3AF' }}
                >
                  Room for growth
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Distribution */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge 
                  variant="secondary" 
                  className="text-lg px-4 py-2 transition-all hover:shadow-md"
                  style={{ 
                    backgroundColor: '#10B981',
                    color: 'white'
                  }}
                >
                  Beginner: {levelDistribution.beginner}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="text-lg px-4 py-2 transition-all hover:shadow-md"
                  style={{ 
                    backgroundColor: '#F59E0B',
                    color: 'white'
                  }}
                >
                  Intermediate: {levelDistribution.intermediate}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="text-lg px-4 py-2 transition-all hover:shadow-md"
                  style={{ 
                    backgroundColor: '#EF4444',
                    color: 'white'
                  }}
                >
                  Advanced: {levelDistribution.advanced}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Charts & Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart - Score Over Time */}
            <Card 
              className="border transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader>
                <CardTitle 
                  className="flex items-center space-x-2"
                  style={{ color: '#9CA3AF' }}
                >
                  <Activity className="h-5 w-5" />
                  <span>Score Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Skill Performance */}
            <Card 
              className="border transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader>
                <CardTitle 
                  className="flex items-center space-x-2"
                  style={{ color: '#9CA3AF' }}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Skill-wise Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="skill" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="easy" fill="#10B981" name="Easy" />
                    <Bar dataKey="medium" fill="#F59E0B" name="Medium" />
                    <Bar dataKey="hard" fill="#EF4444" name="Hard" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart - Question Type Distribution */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle 
                className="flex items-center space-x-2"
                style={{ color: '#9CA3AF' }}
              >
                <PieChartIcon className="h-5 w-5" />
                <span>Question Type Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 
                    className="text-sm mb-4"
                    style={{ color: '#9CA3AF' }}
                  >
                    Interview Mode
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={questionTypeData.slice(0, 2)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {questionTypeData.slice(0, 2).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 
                    className="text-sm mb-4"
                    style={{ color: '#9CA3AF' }}
                  >
                    Question Source
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={questionTypeData.slice(2, 4)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {questionTypeData.slice(2, 4).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card 
              className="border transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader>
                <CardTitle 
                  className="flex items-center space-x-2"
                  style={{ color: '#10B981' }}
                >
                  <Star className="h-5 w-5" />
                  <span>Top Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strengths.map((strength, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{strength.skill}</span>
                      <span style={{ color: '#10B981' }}>{strength.score}%</span>
                    </div>
                    <Progress 
                      value={strength.score} 
                      className="h-2"
                      style={{ 
                        backgroundColor: '#374151'
                      }}
                    />
                    <p 
                      className="text-sm italic flex items-start space-x-2"
                      style={{ color: '#9CA3AF' }}
                    >
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                      <span>{strength.tip}</span>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card 
              className="border transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader>
                <CardTitle 
                  className="flex items-center space-x-2"
                  style={{ color: '#F59E0B' }}
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{weakness.skill}</span>
                      <span style={{ color: '#F59E0B' }}>{weakness.score}%</span>
                    </div>
                    <Progress 
                      value={weakness.score} 
                      className="h-2"
                      style={{ 
                        backgroundColor: '#374151'
                      }}
                    />
                    <p 
                      className="text-sm italic flex items-start space-x-2"
                      style={{ color: '#9CA3AF' }}
                    >
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                      <span>{weakness.tip}</span>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Metrics */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Evaluation Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="h-5 w-5" style={{ color: '#3B82F6' }} />
                    <h4 style={{ color: '#9CA3AF' }}>Average Response Time</h4>
                  </div>
                  <div className="text-2xl text-white mb-2">{evaluationMetrics.avgResponseTime}</div>
                  <Progress 
                    value={70} 
                    className="h-2"
                    style={{ backgroundColor: '#374151' }}
                  />
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#9CA3AF' }}
                  >
                    Within optimal range
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Target className="h-5 w-5" style={{ color: '#10B981' }} />
                    <h4 style={{ color: '#9CA3AF' }}>Average Evaluation Time</h4>
                  </div>
                  <div className="text-2xl text-white mb-2">{evaluationMetrics.avgEvaluationTime}</div>
                  <Progress 
                    value={85} 
                    className="h-2"
                    style={{ backgroundColor: '#374151' }}
                  />
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#9CA3AF' }}
                  >
                    Excellent processing speed
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5" style={{ color: '#8B5CF6' }} />
                    <h4 style={{ color: '#9CA3AF' }}>Consistency Score</h4>
                  </div>
                  <div 
                    className="text-2xl mb-2"
                    style={{ color: getMetricColor(evaluationMetrics.consistencyScore, { good: 80, warning: 60 }) }}
                  >
                    {evaluationMetrics.consistencyScore}%
                  </div>
                  <Progress 
                    value={evaluationMetrics.consistencyScore} 
                    className="h-2"
                    style={{ backgroundColor: '#374151' }}
                  />
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#9CA3AF' }}
                  >
                    High consistency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}