import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Lock, 
  Upload,
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProfileSetupProps {
  username: string;
  onBack: () => void;
}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile data:', profileData);
    // Handle profile save logic here
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
              <h1 className="text-white">Profile Setup</h1>
              <p 
                className="text-sm"
                style={{ color: '#9CA3AF' }}
              >
                Complete your profile to get personalized interview questions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Profile Picture</CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Upload a professional photo for your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-6">
              <Avatar 
                className="h-24 w-24 transition-all duration-200 hover:shadow-lg"
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
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: '#6B7280',
                  color: '#9CA3AF',
                  backgroundColor: 'transparent'
                }}
              >
                <Camera className="h-4 w-4" />
                <span>Change Photo</span>
              </Button>
            </CardContent>
          </Card>


          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="transition-all duration-200 hover:scale-105"
              style={{
                borderColor: '#6B7280',
                color: '#9CA3AF',
                backgroundColor: 'transparent'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <Save className="h-4 w-4" />
              <span>Save Profile</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}