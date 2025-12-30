// root/src/components/Analytics.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Clock,
  Target,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
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
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AnalyticsProps {
  username: string;
  onBackToAdminDashboard: () => void;
}

export default function Analytics({ username, onBackToAdminDashboard }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [roleFilter, setRoleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Chart colors - muted for dark backgrounds
  const chartColors = {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6'
  };

  // Mock data for charts
  const dailyActiveUsers = [
    { date: '01 Jul', users: 45 },
    { date: '02 Jul', users: 52 },
    { date: '03 Jul', users: 48 },
    { date: '04 Jul', users: 61 },
    { date: '05 Jul', users: 55 },
    { date: '06 Jul', users: 67 },
    { date: '07 Jul', users: 59 },
    { date: '08 Jul', users: 73 },
    { date: '09 Jul', users: 68 },
    { date: '10 Jul', users: 82 },
    { date: '11 Jul', users: 76 },
    { date: '12 Jul', users: 89 },
    { date: '13 Jul', users: 94 },
    { date: '14 Jul', users: 87 },
    { date: '15 Jul', users: 92 },
    { date: '16 Jul', users: 96 },
    { date: '17 Jul', users: 103 },
    { date: '18 Jul', users: 98 },
    { date: '19 Jul', users: 112 },
    { date: '20 Jul', users: 108 }
  ];

  const monthlyActiveUsers = [
    { month: 'Feb', users: 1250 },
    { month: 'Mar', users: 1420 },
    { month: 'Apr', users: 1680 },
    { month: 'May', users: 1890 },
    { month: 'Jun', users: 2100 },
    { month: 'Jul', users: 2380 }
  ];

  const roleDistribution = [
    { name: 'Frontend Developer', value: 35, color: chartColors.blue },
    { name: 'Backend Developer', value: 28, color: chartColors.green },
    { name: 'Data Analyst', value: 18, color: chartColors.orange },
    { name: 'Full Stack Developer', value: 12, color: chartColors.purple },
    { name: 'UI/UX Designer', value: 7, color: chartColors.red }
  ];

  const topQuestions = [
    { question: 'JavaScript Fundamentals', answered: 245, skipped: 12 },
    { question: 'React Components', answered: 198, skipped: 18 },
    { question: 'Database Queries', answered: 187, skipped: 22 },
    { question: 'API Development', answered: 172, skipped: 15 },
    { question: 'System Design', answered: 156, skipped: 28 },
    { question: 'Data Structures', answered: 143, skipped: 19 },
    { question: 'Cloud Architecture', answered: 128, skipped: 31 },
    { question: 'Testing Strategies', answered: 115, skipped: 25 },
    { question: 'DevOps Practices', answered: 98, skipped: 33 },
    { question: 'Security Principles', answered: 87, skipped: 29 }
  ];

  const performanceMetrics = [
    { metric: 'API Response Time', value: 245, unit: 'ms', status: 'good' },
    { metric: 'LLM Evaluation Time', value: 1.8, unit: 's', status: 'warning' },
    { metric: 'Error Rate', value: 0.3, unit: '%', status: 'good' },
    { metric: 'Uptime', value: 99.7, unit: '%', status: 'good' }
  ];

  const engagementData = [
    { stage: 'Started', users: 1000, color: chartColors.blue },
    { stage: 'Answered Q1', users: 850, color: chartColors.green },
    { stage: 'Answered Q3', users: 720, color: chartColors.orange },
    { stage: 'Completed', users: 650, color: chartColors.purple }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg border shadow-lg"
          style={{ 
            backgroundColor: '#1F2937', 
            borderColor: '#374151',
            color: '#FFFFFF'
          }}
        >
          <p className="text-sm">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return chartColors.green;
      case 'warning': return chartColors.orange;
      case 'error': return chartColors.red;
      default: return chartColors.blue;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151', }}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBackToAdminDashboard}
                className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl mb-2 text-white">Analytics Dashboard</h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                Real-time platform insights for admins
              </p>
            </div>
            <div />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: '#1F2937',
          borderColor: '#374151'
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" style={{ color: '#9CA3AF' }} />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>Filters:</span>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger 
                className="w-40 text-white"
                style={{ 
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
              >
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger 
                className="w-48 text-white"
                style={{ 
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
              >
                <SelectValue placeholder="Role Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                <SelectItem value="data">Data Analyst</SelectItem>
                <SelectItem value="design">UI/UX Designer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger 
                className="w-48 text-white"
                style={{ 
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
              >
                <SelectValue placeholder="Question Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="system-design">System Design</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* User Stats Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl text-white mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5" style={{ color: chartColors.blue }} />
              <span>User Stats</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Daily Active Users */}
              <Card 
                className="border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" style={{ color: chartColors.blue }} />
                    <span>Active Users (Daily)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyActiveUsers.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <YAxis 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke={chartColors.blue} 
                        strokeWidth={2}
                        dot={{ fill: chartColors.blue, strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Active Users */}
              <Card 
                className="border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" style={{ color: chartColors.green }} />
                    <span>Active Users (Monthly)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyActiveUsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <YAxis 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="users" fill={chartColors.green} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card 
                className="border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center space-x-2">
                    <Target className="h-4 w-4" style={{ color: chartColors.orange }} />
                    <span>Role-wise Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {roleDistribution.map((role, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>
                          {role.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Question Usage Section */}
          <Card 
            className="border rounded-xl transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" style={{ color: chartColors.orange }} />
                <span>Question Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-sm mb-3">Top 10 Most Answered Questions</h4>
                  <div className="space-y-2">
                    {topQuestions.slice(0, 5).map((q, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: '#9CA3AF' }}>
                          {q.question}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className="text-xs px-2 py-1 border-0 text-white"
                            style={{ backgroundColor: chartColors.green }}
                          >
                            {q.answered}
                          </Badge>
                          <Badge 
                            className="text-xs px-2 py-1 border-0 text-white"
                            style={{ backgroundColor: chartColors.red }}
                          >
                            {q.skipped} skipped
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator style={{ backgroundColor: '#374151' }} />

                <div>
                  <h4 className="text-white text-sm mb-3">Question Completion Rate</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={topQuestions.slice(0, 5)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis 
                        type="number"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <YAxis 
                        type="category"
                        dataKey="question"
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        axisLine={{ stroke: '#4B5563' }}
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="answered" fill={chartColors.green} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="skipped" fill={chartColors.red} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Performance Section */}
          <Card 
            className="border rounded-xl transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5" style={{ color: chartColors.purple }} />
                <span>System Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: '#9CA3AF' }}>
                        {metric.metric}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-lg">{metric.value}</span>
                        <span className="text-sm" style={{ color: '#9CA3AF' }}>
                          {metric.unit}
                        </span>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getStatusColor(metric.status) }}
                        />
                      </div>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full"
                      style={{ backgroundColor: '#4B5563' }}
                    >
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: getStatusColor(metric.status),
                          width: `${Math.min((metric.value / (metric.metric.includes('Error') ? 1 : metric.metric.includes('Uptime') ? 100 : 3000)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}

                <Separator style={{ backgroundColor: '#374151' }} />

                <div>
                  <h4 className="text-white text-sm mb-3 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Response Time Trend</span>
                  </h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={dailyActiveUsers.slice(-7).map((d, i) => ({ 
                      date: d.date, 
                      responseTime: 200 + Math.sin(i) * 50 + Math.random() * 30 
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <YAxis 
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        axisLine={{ stroke: '#4B5563' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke={chartColors.purple} 
                        strokeWidth={2}
                        dot={{ fill: chartColors.purple, strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Engagement Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl text-white mb-4 flex items-center space-x-2">
              <Target className="h-5 w-5" style={{ color: chartColors.green }} />
              <span>Engagement & Behavior</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Funnel Chart */}
              <Card 
                className="border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white text-base">Question Completion Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {engagementData.map((stage, index) => {
                      const percentage = index === 0 ? 100 : (stage.users / engagementData[0].users) * 100;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#9CA3AF' }}>
                              {stage.stage}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-white text-sm">{stage.users}</span>
                              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div 
                            className="h-3 rounded-full"
                            style={{ backgroundColor: '#4B5563' }}
                          >
                            <div 
                              className="h-3 rounded-full"
                              style={{ 
                                backgroundColor: stage.color,
                                width: `${percentage}%`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Heatmap */}
              <Card 
                className="border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Login Activity Heatmap</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => {
                      const intensity = Math.random();
                      return (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
                          style={{ 
                            backgroundColor: intensity > 0.7 ? chartColors.green : 
                                           intensity > 0.4 ? chartColors.orange : 
                                           intensity > 0.2 ? chartColors.blue : '#4B5563'
                          }}
                          title={`Day ${i + 1}: ${Math.floor(intensity * 100)} logins`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs" style={{ color: '#9CA3AF' }}>
                    <span>Less</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#4B5563' }} />
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.blue }} />
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.orange }} />
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.green }} />
                    </div>
                    <span>More</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}