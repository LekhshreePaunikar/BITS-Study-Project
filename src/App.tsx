// root/src/App.tsx

import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import FlaggedContentModeration from './components/FlaggedContentModeration';
import ManageQuestions from './components/ManageQuestions';
import ManageUsers from './components/ManageUsers';
import Analytics from './components/Analytics';
import ProfileSetup from './components/ProfileSetup';
import LogoutConfirmation from './components/LogoutConfirmation';
import InterviewSetup, { InterviewConfig } from './components/InterviewSetup';
import InterviewQuestion from './components/InterviewQuestion';
import SessionCompletion from './components/SessionCompletion';
import DetailedFeedback from './components/DetailedFeedback';
import PastSessions from './components/PastSessions';
import PerformanceReport from './components/PerformanceReport';
import HelpAndSupport from './components/HelpAndSupport';
import { Toaster } from './components/ui/sonner';

type ViewType = 'login' | 'signup' | 'dashboard' | 'admin-dashboard' | 'flagged-content' | 'manage-questions' | 'manage-users' | 'analytics' | 'profile' | 'logout' | 'interview-setup' | 'interview' | 'session-completion' | 'detailed-feedback' | 'past-sessions' | 'performance-report' | 'help-support';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [sessionData, setSessionData] = useState<{
    totalScore: number;
    timeSpent: number;
    questionsAnswered: number;
    totalQuestions: number;
  } | null>(null);

  // Check for remembered user on app initialization
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberUser');
    if (rememberedUser) {
      try {
        const userData = JSON.parse(rememberedUser);
        if (userData.rememberMe && userData.username) {
          // Auto-login the remembered user
          setCurrentUser(userData.username);
          setIsAdmin(userData.isAdmin || false);
          setCurrentView(userData.isAdmin ? 'admin-dashboard' : 'dashboard');
        }
      } catch (error) {
        console.error('Error parsing remembered user data:', error);
        localStorage.removeItem('rememberUser');
      }
    }
  }, []);

  const switchToSignUp = () => {
    setCurrentView('signup');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    setIsAdmin(false);
    setCurrentView('dashboard');
  };

  const handleAdminLoginSuccess = (username: string) => {
    setCurrentUser(username);
    setIsAdmin(true);
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setCurrentView('logout');
  };

  const handleConfirmLogout = () => {
    // Clear the user but stay on the logout page to show success message
    setCurrentUser('');
    setIsAdmin(false);
    // Clear remembered user data on explicit logout
    localStorage.removeItem('rememberUser');
    // Don't change the view - stay on 'logout' to show the success message
  };

  const handleReLogin = () => {
    // Only redirect to login when user explicitly clicks "Login Again"
    setCurrentView('login');
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentView(isAdmin ? 'admin-dashboard' : 'dashboard');
  };

  const handleStartInterviewSetup = () => {
    setCurrentView('interview-setup');
  };

  const handleViewPastSessions = () => {
    setCurrentView('past-sessions');
  };

  const handleViewPerformanceReport = () => {
    setCurrentView('performance-report');
  };

  const handleGetHelp = () => {
    setCurrentView('help-support');
  };

  const handleFlaggedContent = () => {
    setCurrentView('flagged-content');
  };

  const handleBackToAdminDashboard = () => {
    setCurrentView('admin-dashboard');
  };

  const handleManageQuestions = () => {
    setCurrentView('manage-questions');
  };

  const handleManageUsers = () => {
    setCurrentView('manage-users');
  };

  const handleAnalytics = () => {
    setCurrentView('analytics');
  };

  const handleStartInterview = (config: InterviewConfig) => {
    console.log('Starting interview with config:', config);
    setInterviewConfig(config);
    setCurrentView('interview');
  };

  const handleEndInterview = () => {
    // Generate mock session data
    const mockSessionData = {
      totalScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      timeSpent: Math.floor(Math.random() * 1800) + 600, // Random time between 10-40 minutes
      questionsAnswered: interviewConfig?.level === 'beginner' ? 5 : interviewConfig?.level === 'intermediate' ? 7 : 10,
      totalQuestions: interviewConfig?.level === 'beginner' ? 5 : interviewConfig?.level === 'intermediate' ? 7 : 10
    };
    
    setSessionData(mockSessionData);
    setCurrentView('session-completion');
  };

  const handleSessionCompletionBackToDashboard = () => {
    // Clear interview data and return to dashboard
    setInterviewConfig(null);
    setSessionData(null);
    setCurrentView('dashboard');
  };

  const handleViewDetailedFeedback = () => {
    setCurrentView('detailed-feedback');
  };

  const handleDetailedFeedbackBackToDashboard = () => {
    // Clear interview data and return to dashboard
    setInterviewConfig(null);
    setSessionData(null);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm 
            onSwitchToSignUp={switchToSignUp} 
            onLoginSuccess={handleLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
          />
        );
      case 'signup':
        return (
          <SignUpForm onSwitchToLogin={switchToLogin} />
        );
      case 'dashboard':
        return (
          <Dashboard 
            username={currentUser} 
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
            onStartInterview={handleStartInterviewSetup}
            onViewPastSessions={handleViewPastSessions}
            onViewPerformanceReport={handleViewPerformanceReport}
            onGetHelp={handleGetHelp}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            username={currentUser}
            onLogout={handleLogout}
            onFlaggedContent={handleFlaggedContent}
            onManageQuestions={handleManageQuestions}
            onManageUsers={handleManageUsers}
            onAnalytics={handleAnalytics}
          />
        );
      case 'flagged-content':
        return (
          <FlaggedContentModeration
            username={currentUser}
            onBackToAdminDashboard={handleBackToAdminDashboard}
          />
        );
      case 'manage-questions':
        return (
          <ManageQuestions
            username={currentUser}
            onBackToAdminDashboard={handleBackToAdminDashboard}
          />
        );
      case 'manage-users':
        return (
          <ManageUsers
            username={currentUser}
            onBackToAdminDashboard={handleBackToAdminDashboard}
          />
        );
      case 'analytics':
        return (
          <Analytics
            username={currentUser}
            onBackToAdminDashboard={handleBackToAdminDashboard}
          />
        );
      case 'profile':
        return (
          <ProfileSetup 
            username={currentUser}
            onBack={handleBackToDashboard}
          />
        );
      case 'interview-setup':
        return (
          <InterviewSetup
            username={currentUser}
            onBack={handleBackToDashboard}
            onStartInterview={handleStartInterview}
          />
        );
      case 'interview':
        return interviewConfig ? (
          <InterviewQuestion
            username={currentUser}
            config={interviewConfig}
            onEndInterview={handleEndInterview}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : null;
      case 'session-completion':
        return interviewConfig && sessionData ? (
          <SessionCompletion
            username={currentUser}
            config={interviewConfig}
            sessionData={sessionData}
            onBackToDashboard={handleSessionCompletionBackToDashboard}
            onViewDetailedFeedback={handleViewDetailedFeedback}
          />
        ) : null;
      case 'detailed-feedback':
        return interviewConfig && sessionData ? (
          <DetailedFeedback
            username={currentUser}
            config={interviewConfig}
            sessionData={sessionData}
            onBackToDashboard={handleDetailedFeedbackBackToDashboard}
          />
        ) : null;
      case 'past-sessions':
        return (
          <PastSessions
            username={currentUser}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      case 'performance-report':
        return (
          <PerformanceReport
            username={currentUser}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      case 'help-support':
        return (
          <HelpAndSupport
            username={currentUser}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      case 'logout':
        return (
          <LogoutConfirmation
            username={currentUser}
            onBack={handleBackToDashboard}
            onConfirmLogout={handleConfirmLogout}
            onReLogin={handleReLogin}
          />
        );
      default:
        return (
          <LoginForm 
            onSwitchToSignUp={switchToSignUp} 
            onLoginSuccess={handleLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
          />
        );
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
        {(currentView === 'dashboard' || currentView === 'admin-dashboard' || currentView === 'flagged-content' || currentView === 'manage-questions' || currentView === 'manage-users' || currentView === 'analytics' || currentView === 'profile' || currentView === 'logout' || currentView === 'interview-setup' || currentView === 'interview' || currentView === 'session-completion' || currentView === 'detailed-feedback' || currentView === 'past-sessions' || currentView === 'performance-report' || currentView === 'help-support') ? (
          renderCurrentView()
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#111827' }}>
            {renderCurrentView()}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}