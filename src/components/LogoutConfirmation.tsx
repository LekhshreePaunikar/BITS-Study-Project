import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  LogOut, 
  ArrowLeft, 
  CheckCircle,
  RotateCcw
} from 'lucide-react';

interface LogoutConfirmationProps {
  username: string;
  onBack: () => void;
  onConfirmLogout: () => void;
  onReLogin: () => void;
}

export default function LogoutConfirmation({ 
  username, 
  onBack, 
  onConfirmLogout, 
  onReLogin 
}: LogoutConfirmationProps) {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleLogout = () => {
    setIsLoggedOut(true);
    // Simulate logout process
    setTimeout(() => {
      onConfirmLogout();
    }, 2000);
  };

  if (isLoggedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#111827' }}>
        <Card 
          className="w-full max-w-md mx-auto border transition-all duration-200 hover:shadow-xl"
          style={{ 
            backgroundColor: '#1F2937',
            borderColor: '#374151',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardHeader className="text-center">
            <div 
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <CheckCircle className="h-8 w-8" style={{ color: '#10B981' }} />
            </div>
            <CardTitle className="text-white">Successfully Logged Out</CardTitle>
            <CardDescription style={{ color: '#9CA3AF' }}>
              Thank you for using our interview practice platform, {username}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p 
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Your session has been ended securely. We hope you had a great practice experience!
              </p>
              <div 
                className="rounded-lg p-4 mt-4"
                style={{ backgroundColor: '#374151' }}
              >
                <p className="text-sm text-white">
                  💡 <strong>Keep practicing!</strong> Regular interview practice helps build confidence and improves your performance.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={onReLogin} 
                className="w-full flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Login Again</span>
              </Button>
              
              <div className="text-center">
                <p 
                  className="text-xs"
                  style={{ color: '#9CA3AF' }}
                >
                  Want to continue your journey? Log back in anytime!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="flex items-center space-x-2 transition-all duration-200"
              style={{ 
                color: '#9CA3AF',
                backgroundColor: 'transparent'
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-white">Logout Confirmation</h1>
              <p 
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Are you sure you want to end your session?
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-88px)]">
        <Card 
          className="w-full max-w-md mx-auto border transition-all duration-200 hover:shadow-xl"
          style={{ 
            backgroundColor: '#1F2937',
            borderColor: '#374151',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-16 w-16 mx-auto transition-all duration-200 hover:shadow-lg">
                <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80`} alt={username} />
                <AvatarFallback 
                  className="text-white"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-white">Confirm Logout</CardTitle>
            <CardDescription style={{ color: '#9CA3AF' }}>
              Hi {username}, are you sure you want to logout from your account?
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: '#374151' }}
            >
              <div className="flex items-start space-x-3">
                <LogOut 
                  className="h-5 w-5 mt-0.5" 
                  style={{ color: '#9CA3AF' }}
                />
                <div className="space-y-1">
                  <p className="text-sm text-white">You will be signed out of your account</p>
                  <p 
                    className="text-xs"
                    style={{ color: '#9CA3AF' }}
                  >
                    Your progress and data will be saved. You can log back in anytime to continue your interview practice.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{ backgroundColor: '#EF4444' }}
              >
                <LogOut className="h-4 w-4" />
                <span>Yes, Logout</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onBack}
                className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  borderColor: '#6B7280',
                  color: '#9CA3AF',
                  backgroundColor: 'transparent'
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="text-center pt-2">
              <p 
                className="text-xs"
                style={{ color: '#9CA3AF' }}
              >
                Changed your mind? You can always stay logged in and continue practicing.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}