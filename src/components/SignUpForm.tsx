// root/src/components/SignUpForm.tsx

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { authAPI } from "../utils/api";
import logo from '@/assets/images/platform/logo.png';


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      alert("Registration successful. Please log in.");
      onSwitchToLogin(); // redirect to Login page

    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("User already exists");
        onSwitchToLogin(); // redirect to Login page
      } else {
        alert(
          err.response?.data?.message ||
          "Registration failed. Please try again."
        );
      }
    }
  };


  return (
    <div>
      <div className="flex justify-center mb-12">
        <img
          src={logo}
          alt="ClariPrep Logo"
          className="h-52 w-auto object-contain"
        />

      </div>

      <Card
        className="w-full min-w-[400px] max-w-[400px] mx-auto border rounded-2xl transition-all duration-200 hover:shadow-xl"
        style={{
          backgroundColor: "#1F2937",
          borderColor: "#374151",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          borderRadius: "10px",
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
                onCheckedChange={(checked: boolean) => setRememberMe(checked === true)}
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
    </div>
  );
}