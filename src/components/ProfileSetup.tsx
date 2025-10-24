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

export default function ProfileSetup({ username, onBack }: ProfileSetupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    password: '',
    gender: '',
    phone: '',
    location: '',
    
    // Professional Information
    preferredRole: '',
    skills: [] as string[],
    programmingLanguages: [] as string[],
    experienceLevel: '',
    
    // Education & Background
    education: '',
    university: '',
    graduationYear: '',
    
  });




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
{/* ---------------------------- */}
          {/* Personal Information */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Personal Information</CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Basic information about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="fullName"
                  style={{ color: '#9CA3AF' }}
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  style={{ color: '#9CA3AF' }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  style={{ color: '#9CA3AF' }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={profileData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pr-10 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
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
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="gender"
                  style={{ color: '#9CA3AF' }}
                >
                  Gender
                </Label>
                <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger 
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="phone"
                  style={{ color: '#9CA3AF' }}
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="location"
                  style={{ color: '#9CA3AF' }}
                >
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>
            </CardContent>
          </Card>
{/* --------------------------------- */}
          {/* Professional Information */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Professional Information</CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Your career preferences and technical skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="preferredRole"
                    style={{ color: '#9CA3AF' }}
                  >
                    Preferred Role
                  </Label>
                  <Select value={profileData.preferredRole} onValueChange={(value) => handleInputChange('preferredRole', value)}>
                    <SelectTrigger 
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4B5563',
                        color: '#FFFFFF'
                      }}
                    >
                      <SelectValue placeholder="Select your preferred role" />
                    </SelectTrigger>
                    <SelectContent>
                      {preferredRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="experienceLevel"
                    style={{ color: '#9CA3AF' }}
                  >
                    Experience Level
                  </Label>
                  <Select value={profileData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                    <SelectTrigger 
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4B5563',
                        color: '#FFFFFF'
                      }}
                    >
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label style={{ color: '#9CA3AF' }}>Skills</Label>
                <div 
                  className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg"
                  style={{ 
                    backgroundColor: '#374151',
                    borderColor: '#4B5563'
                  }}
                >
                  {skillsOptions.map(skill => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.skills.includes(skill)}
                        onChange={() => handleMultiSelectChange('skills', skill)}
                        className="rounded"
                        style={{ 
                          backgroundColor: '#4B5563',
                          borderColor: '#6B7280'
                        }}
                      />
                      <span className="text-sm text-white">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label style={{ color: '#9CA3AF' }}>Programming Languages</Label>
                <div 
                  className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg"
                  style={{ 
                    backgroundColor: '#374151',
                    borderColor: '#4B5563'
                  }}
                >
                  {programmingLanguagesOptions.map(lang => (
                    <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.programmingLanguages.includes(lang)}
                        onChange={() => handleMultiSelectChange('programmingLanguages', lang)}
                        className="rounded"
                        style={{ 
                          backgroundColor: '#4B5563',
                          borderColor: '#6B7280'
                        }}
                      />
                      <span className="text-sm text-white">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

{/* --------------------------------------- */}
          {/* Education */}
          <Card 
            className="border transition-all duration-200 hover:shadow-lg"
            style={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Education</CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Your educational background
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="education"
                  style={{ color: '#9CA3AF' }}
                >
                  Education Level
                </Label>
                <Select value={profileData.education} onValueChange={(value) => handleInputChange('education', value)}>
                  <SelectTrigger 
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  >
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="university"
                  style={{ color: '#9CA3AF' }}
                >
                  University/Institution
                </Label>
                <Input
                  id="university"
                  placeholder="Enter your university or institution"
                  value={profileData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="graduationYear"
                  style={{ color: '#9CA3AF' }}
                >
                  Graduation Year
                </Label>
                <Input
                  id="graduationYear"
                  placeholder="e.g., 2024"
                  value={profileData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>
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