import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up attempt:', formData, 'Remember me:', rememberMe);
    
    // Handle sign up logic here
    if (rememberMe) {
      // Store user preferences in localStorage for future sessions
      localStorage.setItem('rememberUser', JSON.stringify({
        username: formData.username,
        email: formData.email,
        rememberMe: true
      }));
    }
  };

  return (
    <Card 
      className="w-full max-w-md mx-auto border transition-all duration-200 hover:shadow-xl"
      style={{ 
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}
    >
      <CardHeader className="space-y-1">
        <CardTitle 
          className="text-center text-white"
        >
          Create Account
        </CardTitle>
        <CardDescription 
          className="text-center"
          style={{ color: '#9CA3AF' }}
        >
          Enter your information to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="signup-username"
              style={{ color: '#9CA3AF' }}
            >
              Username
            </Label>
            <div className="relative">
              <User 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: '#6B7280' }}
              />
              <Input
                id="signup-username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="pl-10 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="signup-email"
              style={{ color: '#9CA3AF' }}
            >
              Email
            </Label>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: '#6B7280' }}
              />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="signup-password"
              style={{ color: '#9CA3AF' }}
            >
              Password
            </Label>
            <div className="relative">
              <Lock 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: '#6B7280' }}
              />
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4B5563',
                  color: '#FFFFFF'
                }}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                style={{ color: '#6B7280' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p 
              className="text-xs"
              style={{ color: '#9CA3AF' }}
            >
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="signup-remember-me" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              style={{
                borderColor: '#4B5563'
              }}
            />
            <Label 
              htmlFor="signup-remember-me" 
              className="text-sm cursor-pointer"
              style={{ color: '#9CA3AF' }}
            >
              Remember me
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            Create Account
          </Button>

          <div className="text-center">
            <p 
              className="text-sm"
              style={{ color: '#9CA3AF' }}
            >
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-white hover:underline transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}