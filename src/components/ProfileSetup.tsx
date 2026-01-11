// root/src/components/ProfileSetup.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import api from "../utils/api";


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
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [localResumePreview, setLocalResumePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const handleProfileImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowed.includes(file.type)) {
    alert('Only PNG, JPG, JPEG images allowed');
    return;
  }

  setProfileImage(URL.createObjectURL(file));

  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    const res = await api.post('/user/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log('Profile image saved:', res.data.profileImage);
    setProfileImage(`http://localhost:3001${res.data.profileImage}`);
  } catch (err) {
    alert('Failed to upload profile image');
  }
};
  const [profileData, setProfileData] = useState(() => ({
    // Personal Information
    fullName: username || '',      // prefill with the logged-in username
    email: '',
    password: '********',          // non-editable, not null
    gender: '',
    phone_number: '',
    location: '',

    // Professional Information
    preferredRole: '',
    skills: [] as string[],
    programmingLanguages: [] as string[],
    experienceLevel: '',

    // Education & Background
    education: '',
    university: '',
    graduation_year: '',

    // Additional Information
    hobbies: '',
    linkedinProfile: '',
    githubProfile: '',
    portfolio: '',

    // Resume
    resumeFile: null as File | null
  }));

  
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found');
          return;
        }

        const res = await api.get('/user');
        const data = res.data;
        console.log('Fetched profile data:', data); // Debug log

if (data.profileImage) {
  setProfileImage(`http://localhost:3001${res.data.profileImage}?t=${new Date().getTime()}`);
}

if (data.resumePath) {
  setResumePreview(`http://localhost:3001${data.resumePath}`);
}

        const normalized = {
          fullName: data.fullName || username || '',
          email: data.email || '',
          password: '********', 

          gender: data.gender || '',
          phone_number: data.phone_number || '',
          location: data.location || '',

          preferredRole: data.preferredRole || '',
          skills: data.skills || [],
          programmingLanguages: data.programmingLanguages || [],
          experienceLevel: data.experienceLevel || '',

          education: data.education || '',
          university: data.university || '',
          graduation_year: data.graduation_year || '',

          hobbies: data.hobbies || '',
          linkedinProfile: data.linkedinProfile || '',
          githubProfile: data.githubProfile || '',
          portfolio: data.portfolio || '',

          resumeFile: null
        };

        setProfileData({
  fullName: data.fullName || username || '',
  email: data.email || '',
  password: '********',
  gender: data.gender || '',
  phone_number: data.phone_number || '',
  location: data.location || '',
  preferredRole: data.preferredRole || '',
  skills: Array.isArray(data.skills) ? data.skills : [],
  programmingLanguages: Array.isArray(data.programmingLanguages) ? data.programmingLanguages : [],
  experienceLevel: data.experienceLevel || '',
  education: data.education || '',
  university: data.university || '',
  graduation_year: data.graduation_year ? String(data.graduation_year) : '',
  hobbies: data.hobbies || '',
  linkedinProfile: data.linkedinProfile || '',
  githubProfile: data.githubProfile || '',
  portfolio: data.portfolio || '',
  resumeFile: null
});

}catch (err) {
        console.error('Error fetching profile:', err);
      }
      finally {
  setIsLoading(false);
}
      
    };

    fetchProfile();
  }, [username]);


  const preferredRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Mobile Developer',
    'UI/UX Designer',
    'Product Manager',
    'Software Architect',
    'Quality Assurance Engineer'
  ];

  const skillsOptions = [
    'UI/UX Design',
    'Data Analytics',
    'Data Structures & Algorithms',
    'Problem Solving',
    'System Design',
    'Database Management',
    'API Development',
    'Cloud Computing',
    'Machine Learning',
    'Project Management',
    'Version Control (Git)',
    'Testing & QA',
    'Agile Methodologies',
    'Communication Skills',
    'Leadership'
  ];

  const programmingLanguagesOptions = [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'TypeScript',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'PHP',
    'Ruby',
    'SQL',
    'HTML/CSS',
    'React',
    'Node.js',
    'Angular',
    'Vue.js'
  ];

  const experienceLevels = [
    'Student/Fresher',
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-8 years',
    '8+ years'
  ];

  const educationLevels = [
    'High School',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Diploma',
    'Certification',
    'Self-taught'
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    // Store the file for later upload
    setProfileData(prev => ({
      ...prev,
      resumeFile: file
    }));

    // Show local preview
    setLocalResumePreview(URL.createObjectURL(file));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile data:", profileData);

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Not logged in");
      return;
    }

    try {
      // 1. Upload resume first if a new file was selected
      if (profileData.resumeFile) {
        const formData = new FormData();
        formData.append("resume", profileData.resumeFile);

        const resumeRes = await api.post("/user/resume", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Update saved resume preview
        setResumePreview(`http://localhost:3001${resumeRes.data.resume_path}`);
        // Clear local preview after successful upload
        setLocalResumePreview(null);
      }

      // 2. Update profile data
      const { resumeFile, password, email, ...payload } = profileData;
console.log('Sending payload to backend:', payload); 
      await api.put("/user", payload);
      
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };

  if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111827' }}>
      <p className="text-white text-xl">Loading profile...</p>
    </div>
  );
}
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      {/* Header */}
      <header className="border-b" style={{backgroundColor: '#1F2937',  borderColor: '#374151',}}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBack}
                className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(86, 91, 97, 1)", }}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl mb-2 text-white"> Profile Setup</h1>
              <p className="text-sm" style={{ color: 'white' }}>
                Complete your profile to get personalized interview questions
              </p>
            </div>
            <div />
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
                <AvatarImage
  src={profileImage || undefined}
  alt={username}
/>
<input
  type="file"
  accept=".png,.jpg,.jpeg"
  hidden
  id="profile-image-input"
  onChange={handleProfileImageChange}
/>

                <AvatarFallback
                  className="text-white"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
  type="button"
  variant="outline"
  onClick={() =>
    document.getElementById('profile-image-input')?.click()
  }
>
  <Camera className="h-4 w-4" />
  <span>Change Photo</span>
</Button>
            </CardContent>
          </Card>

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
                  disabled
                  className="transition-all duration-200 text-white cursor-not-allowed opacity-70"
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
                    placeholder="Password"
                    value={profileData.password}
                    disabled
                    className="pr-10 transition-all duration-200 text-white cursor-not-allowed opacity-70"
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
                  htmlFor="phone_number"
                  style={{ color: '#9CA3AF' }}
                >
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  placeholder="Enter your phone number"
                  value={profileData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
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
                  htmlFor="graduation_year"
                  style={{ color: '#9CA3AF' }}
                >
                  Graduation Year
                </Label>
                <Input
                  id="graduation_year"
                  placeholder="e.g., 2024"
                  value={profileData.graduation_year}
                  onChange={(e) => handleInputChange('graduation_year', e.target.value)}
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

          {/* Resume Upload */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Resume</CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Upload your resume (PDF only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 hover:shadow-md"
                  style={{ borderColor: '#4B5563' }}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                  <p
                    className="text-sm mb-2"
                    style={{ color: '#9CA3AF' }}
                  >
                    Drag and drop your resume here, or click to browse
                  </p>
                  <input
  id="resume-upload"
  type="file"
  accept=".pdf"
  onChange={handleResumeChange}
/>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    className="transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: '#6B7280',
                      color: '#9CA3AF',
                      backgroundColor: 'transparent'
                    }}
                  >
                    Choose File
                  </Button>
                  {profileData.resumeFile && (
                    <p className="text-sm text-white mt-2">
                      Selected: {profileData.resumeFile.name}
                    </p>
                  )}
                  {/* Instant preview BEFORE save */}
{localResumePreview && (
  <p className="text-sm mt-2">
    <a
      href={localResumePreview}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
      style={{ color: "#60A5FA" }}
    >
      Preview selected resume
    </a>
  </p>
)}

{/* Saved preview AFTER save */}
{resumePreview && (
  <p className="text-sm mt-2">
    <a
      href={resumePreview}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
      style={{ color: "#34D399" }}
    >
      View saved resume
    </a>
  </p>
)}

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#9CA3AF' }}>Additional Information</CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>
                Optional information to help personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="hobbies"
                  style={{ color: '#9CA3AF' }}
                >
                  Hobbies &amp; Interests
                </Label>
                <Textarea
                  id="hobbies"
                  placeholder="Tell us about your hobbies and interests..."
                  value={profileData.hobbies}
                  onChange={(e) => handleInputChange('hobbies', e.target.value)}
                  rows={3}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="linkedinProfile"
                    style={{ color: '#9CA3AF' }}
                  >
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedinProfile"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profileData.linkedinProfile}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
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
                    htmlFor="githubProfile"
                    style={{ color: '#9CA3AF' }}
                  >
                    GitHub Profile
                  </Label>
                  {/* .. */}
                  <Input
                    id="githubProfile"
                    placeholder="https://github.com/yourusername"
                    value={profileData.githubProfile}
                    onChange={(e) => handleInputChange('githubProfile', e.target.value)}
                    className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="portfolio"
                  style={{ color: '#9CA3AF' }}
                >
                  Portfolio Website
                </Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={profileData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
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
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
              style={{ backgroundColor: '#10B981'}}
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