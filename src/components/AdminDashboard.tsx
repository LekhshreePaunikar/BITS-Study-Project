// root/src/components/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  User,
  LogOut,
  Settings,
  BookOpen,
  Flag,
  Users,
  BarChart3,
  Clock,
  Mail,
  Shield,
  ChevronDown,
  Activity,
  AlertTriangle,
  UserCheck,
  FileQuestion,
  TrendingUp
} from 'lucide-react';

import api from "../utils/api"; // or your axios instance

interface AdminDashboardProps {
  onLogout: () => void;
  onEditProfile: () => void;
  onSupportTicket?: () => void;
  onManageQuestions?: () => void;
  onManageUsers?: () => void;
  onAnalytics?: () => void;
}

interface MetricCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

interface AdminAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  onClick: () => void;
}

type Admin = {
  user_id: number;
  name: string;
  email: string;
  profile_image: string | null;
};

export default function AdminDashboard({ onLogout, onEditProfile, onSupportTicket, onManageQuestions, onManageUsers, onAnalytics }: AdminDashboardProps) {
  // Mock metrics data
  const metricsData: MetricCard[] = [
    {
      title: 'Questions Added',
      value: '1,247',
      subtitle: '+23 this week',
      icon: <BookOpen className="h-6 w-6" />,
      color: '#3B82F6',
      trend: '+12%'
    },
    {
      title: 'Support Tickets Generated',
      value: '34',
      subtitle: '8 pending review',
      icon: <Flag className="h-6 w-6" />,
      color: '#EF4444',
      trend: '-5%'
    },
    {
      title: 'Active Users',
      value: '8,932',
      subtitle: '2,341 online now',
      icon: <Users className="h-6 w-6" />,
      color: '#10B981',
      trend: '+18%'
    },
    {
      title: 'Avg. Session Time',
      value: '24.5 min',
      subtitle: 'across all levels',
      icon: <Clock className="h-6 w-6" />,
      color: '#F59E0B',
      trend: '+3%'
    }
  ];

  // Admin action handlers
  const handleManageQuestions = () => {
    if (onManageQuestions) {
      onManageQuestions();
    }
  };

  const handleSupportTicket = () => {
    if (onSupportTicket) {
      onSupportTicket();
    }
  };

  const handleManageUsers = () => {
    if (onManageUsers) {
      onManageUsers();
    }
  };

  const handleAnalytics = () => {
    if (onAnalytics) {
      onAnalytics();
    }
  };

  const handleSubmitTicket = () => {
    console.log('Opening Admin Support Ticket Form...');
    alert('Admin Support Ticket submission would open here');
  };

  // 
  const handleEditProfile = () => {
    onEditProfile();
  };

  const [admin, setAdmin] = useState<Admin | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await api.get("/admin/profile");

        console.log("Admin profile loaded:", res.data);

        if (res.data) {
          setAdmin(res.data);
        } else {
          console.error("Admin profile is empty");
        }
      } catch (err) {
        console.error("Failed to load admin profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  //  ADD THIS BLOCK — REQUIRED
if (loading || !admin) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading admin dashboard...
    </div>
  );
}




  const adminActions: AdminAction[] = [
    {
      title: 'Manage Questions',
      description: 'Add, edit, and organize interview questions',
      icon: <FileQuestion className="h-8 w-8 mb-3" />,
      color: '#1F2937',
      hoverColor: '#3B82F6',
      onClick: handleManageQuestions
    },
    {
      title: 'Support Ticket Monitoring',
      description: 'Review and resolve user support tickets',
      icon: <AlertTriangle className="h-8 w-8 mb-3" />,
      color: '#1F2937',
      hoverColor: '#EF4444',
      onClick: handleSupportTicket
    },
    {
      title: 'Manage Users',
      description: 'User accounts and permissions',
      icon: <UserCheck className="h-8 w-8 mb-3" />,
      color: '#1F2937',
      hoverColor: '#10B981',
      onClick: handleManageUsers
    },
    {
      title: 'Analytics',
      description: 'Platform insights and statistics',
      icon: <TrendingUp className="h-8 w-8 mb-3" />,
      color: '#1F2937',
      hoverColor: '#F59E0B',
      onClick: handleAnalytics
    }
  ];





  return (
    <TooltipProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
        {/* Header Bar */}
        <header
          className="border-b px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: '#1F2937',
            borderColor: '#374151'
          }}
        >
          {/* Left: Profile + Name */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-500 bg-gray-700 flex items-center justify-center">
              {admin.profile_image ? (
                <img
                  src={`http://localhost:3001${admin.profile_image}`}
                  alt="Admin avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {admin.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl text-white">
              {admin.name}
            </h1>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-6">
            <Badge
              className="px-3 py-1 text-sm border-2"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#3B82F6',
                color: '#3B82F6'
              }}
            >
              Super Admin
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border border-gray-500">
                    {admin.profile_image ? (
                      <img
                        src={`http://localhost:3001${admin.profile_image}`}
                        alt="Admin avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-white bg-gray-700">
                        {admin.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEditProfile}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={onLogout}
              style={{ borderColor: '#DC2626', color: 'white' }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>


        {/* Main Content */}
        < main className="container mx-auto px-6 py-8" >
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {metricsData.map((metric, index) => (
                <Card
                  key={index}
                  className="border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${metric.color}20` }}
                      >
                        <div style={{ color: metric.color }}>
                          {metric.icon}
                        </div>
                      </div>
                      <div
                        className="text-sm px-2 py-1 rounded flex items-center"
                        style={{
                          backgroundColor: metric.trend?.startsWith('+') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: metric.trend?.startsWith('+') ? '#10B981' : '#EF4444'
                        }}
                      >
                        {metric.trend?.startsWith('+') ?
                          <TrendingUp className="h-3 w-3 mr-1" /> :
                          <Activity className="h-3 w-3 mr-1" />
                        }
                        {metric.trend}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl text-white mb-1">
                        {metric.value}
                      </h3>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        {metric.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        {metric.subtitle}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Admin Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActions.map((action, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Card
                      className="border cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
                      style={{
                        backgroundColor: action.color,
                        borderColor: '#374151'
                      }}
                      onClick={action.onClick}
                    >
                      <CardContent className="p-8 text-center">
                        <div
                          className="transition-colors duration-300"
                          style={{
                            color: '#9CA3AF'
                          }}
                        >
                          {action.icon}
                        </div>
                        <h3 className="text-xl text-white mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                          {action.description}
                        </p>
                        <div
                          className="mt-4 h-1 w-0 bg-current transition-all duration-300 group-hover:w-full mx-auto rounded"
                          style={{ backgroundColor: action.hoverColor }}
                        />
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to access {action.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Support Panel */}
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
                  <Mail className="h-5 w-5" />
                  <span>Admin Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white mb-1">
                      Need technical assistance?
                    </p>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>
                      Contact: tech-support@mockinterview.ai
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmitTicket}
                    className="text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                    style={{
                      backgroundColor: '#3B82F6',
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Submit Admin Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main >

        {/* Footer */}
        < footer
          className="border-t mt-16"
          style={{
            backgroundColor: '#111827',
            borderColor: '#1F2937'
          }
          }
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <div className="flex items-center space-x-1">
                <span style={{ color: '#6B7280' }}>Version:</span>
                <span className="text-white">1.2.5</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <button
                  className="transition-colors duration-200"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  Privacy
                </button>
                <span style={{ color: '#374151' }}>|</span>
                <button
                  className="transition-colors duration-200"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#9CA3AF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  Terms
                </button>
                <span style={{ color: '#374151' }}>|</span>
                <div className="flex items-center space-x-2">
                  <span style={{ color: '#6B7280' }}>Last Synced:</span>
                  <span className="text-white">2 mins ago</span>
                  <div
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#10B981' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </footer >
      </div >
    </TooltipProvider >
  );
}