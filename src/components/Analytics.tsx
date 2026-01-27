// root/src/components/Analytics.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
  Loader2
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
} from 'recharts';

interface AnalyticsProps {
  username: string;
  onBackToAdminDashboard: () => void;
}

interface AnalyticsData {
  dailyActiveUsers: Array<{ date: string; users: number }>;
  monthlyActiveUsers: Array<{ month: string; users: number }>;
  roleDistribution: Array<{ name: string; value: number }>;
  topQuestions: Array<{ question: string; answered: number; skipped: number }>;
  engagementData: Array<{ stage: string; users: number }>;
  heatmapData: Array<{ date: string; logins: number }>;
}

export default function Analytics({ username, onBackToAdminDashboard }: AnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fixed filters (no UI for them)
  const timeRange = '30d';
  const roleFilter = 'all';
  const categoryFilter = 'all';

  // Chart colors
  const chartColors = {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6'
  };

  // Fetch analytics data from database
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          timeRange,
          roleFilter,
          categoryFilter
        });
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/analytics/data?${params}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Use real data or fallback to empty arrays
  const dailyActiveUsers = analyticsData?.dailyActiveUsers || [];
  const monthlyActiveUsers = analyticsData?.monthlyActiveUsers || [];
  const roleDistribution = (analyticsData?.roleDistribution || []).map((role, index) => ({
    ...role,
    color: [chartColors.blue, chartColors.green, chartColors.orange, chartColors.purple, chartColors.red][index % 5]
  }));
  const topQuestions = analyticsData?.topQuestions || [];
  const engagementData = (analyticsData?.engagementData || []).map((stage, index) => ({
    ...stage,
    color: [chartColors.blue, chartColors.green, chartColors.orange, chartColors.purple][index % 4]
  }));
  const heatmapData = analyticsData?.heatmapData || [];

  // HARDCODED System Performance (as requested)
  const performanceMetrics = [
    { metric: 'API Response Time', value: 245, unit: 'ms', status: 'good' },
    { metric: 'LLM Evaluation Time', value: 1.8, unit: 's', status: 'warning' },
    { metric: 'Error Rate', value: 0.3, unit: '%', status: 'good' },
    { metric: 'Uptime', value: 99.7, unit: '%', status: 'good' }
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: chartColors.blue }} />
          <p className="text-white">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: chartColors.red }} />
          <p className="text-white mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151' }}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button 
                variant="outline" 
                onClick={onBackToAdminDashboard}
                className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)" }}
              >
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

          {/* System Performance Section - HARDCODED */}
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
                      const percentage = index === 0 ? 100 : engagementData[0].users > 0 ? (stage.users / engagementData[0].users) * 100 : 0;
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
                    {heatmapData.length > 0 ? (
                      heatmapData.slice(0, 35).reverse().map((day, i) => {
                        const maxLogins = Math.max(...heatmapData.map(d => d.logins), 1);
                        const intensity = day.logins / maxLogins;
                        return (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
                            style={{ 
                              backgroundColor: intensity > 0.7 ? chartColors.green : 
                                             intensity > 0.4 ? chartColors.orange : 
                                             intensity > 0.2 ? chartColors.blue : '#4B5563'
                            }}
                            title={`${new Date(day.date).toLocaleDateString()}: ${day.logins} logins`}
                          />
                        );
                      })
                    ) : (
                      Array.from({ length: 35 }, (_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: '#4B5563' }}
                          title="No data"
                        />
                      ))
                    )}
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