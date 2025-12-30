// root/src/components/InterviewSetup.tsx

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import api from "../utils/api";


import {
  ArrowLeft,
  Play,
  MessageSquare,
  Mic,
  Users,
  FileText,
  User,
  Clock,
  Target,
  BookOpen,
  Briefcase
} from 'lucide-react';

export interface InterviewSession extends InterviewConfig {
  sessionId: number;
}

interface InterviewSetupProps {
  username: string;
  onBack: () => void;
  onStartInterview: (session: InterviewSession) => void;
}


export interface InterviewConfig {
  mode: 'text' | 'voice' | 'both';
  questionSource: 'predefined' | 'resume-based';
  level: 'beginner' | 'intermediate' | 'advanced';
  focusArea: string;
  specificTopics: string;
  preparationTime: number;
}

export default function InterviewSetup({ username, onBack, onStartInterview }: InterviewSetupProps) {
  const [config, setConfig] = useState<InterviewConfig>({
    mode: 'text',
    questionSource: 'predefined',
    level: 'intermediate',
    focusArea: '',
    specificTopics: '',
    preparationTime: 2
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!config.focusArea) {
      alert('Please select a focus area before starting the interview.');
      return;
    }

    try {
      // Start interview session
      const sessionRes = await api.post("/interview/start", {
        interview_mode: config.mode,
        question_source: config.questionSource,
        selected_difficulty: config.level,
        focus_area: config.focusArea,
        prep_time_minutes: config.preparationTime,
        keywords: config.specificTopics
          ? config.specificTopics.split(',').map(s => s.trim())
          : []
      });

      const sessionId = sessionRes.data.session_id;
      console.log("Session Started:", sessionRes.data);

  
      // Continue app flow
      onStartInterview({
        ...config,
        sessionId
      });

    } catch (err) {
      console.error("Error starting interview:", err);
    }
  };

  const getDurationText = (level: string) => {
    switch (level) {
      case 'beginner': return '15 minutes';
      case 'intermediate': return '30 minutes';
      case 'advanced': return '45 minutes';
      default: return '';
    }
  };

  const focusAreas = [
    'Software Engineering',
    'Data Science',
    'Product Management',
    'DevOps/Cloud',
    'UI/UX Design',
    'Marketing',
    'Sales',
    'Finance',
    'Consulting',
    'General/Behavioral'
  ];

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="transition-all duration-200"
                style={{
                  color: '#9CA3AF',
                  backgroundColor: 'transparent'
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div
              className="text-sm"
              style={{ color: '#9CA3AF' }}
            >
              Welcome, {username}
            </div>
            <div />
          </div>
        </div>
      </header>
      

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Interview Mode */}
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
                  <MessageSquare className="h-5 w-5" />
                  <span>Interview Mode</span>
                </CardTitle>
                <CardDescription style={{ color: '#9CA3AF' }}>
                  Choose how you'd like to conduct your interview session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.mode}
                  onValueChange={(value: 'text' | 'voice' | 'both') =>
                    setConfig(prev => ({ ...prev, mode: value }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="text" id="text-mode" />
                      <Label htmlFor="text-mode" className="cursor-pointer flex-1">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" style={{ color: '#3B82F6' }} />
                          <div>
                            <div className="text-white">Text Only</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>Type your responses</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="voice" id="voice-mode" />
                      <Label htmlFor="voice-mode" className="cursor-pointer flex-1">
                        <div className="flex items-center space-x-2">
                          <Mic className="h-4 w-4" style={{ color: '#10B981' }} />
                          <div>
                            <div className="text-white">Voice Only</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>Speak your responses</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="both" id="both-mode" />
                      <Label htmlFor="both-mode" className="cursor-pointer flex-1">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" style={{ color: '#F59E0B' }} />
                          <div>
                            <div className="text-white">Text &amp; Voice</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>Choose per question</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question Source */}
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
                  <FileText className="h-5 w-5" />
                  <span>Question Source</span>
                </CardTitle>
                <CardDescription style={{ color: '#9CA3AF' }}>
                  Select the type of questions for your interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.questionSource}
                  onValueChange={(value: 'predefined' | 'resume-based') =>
                    setConfig(prev => ({ ...prev, questionSource: value }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="predefined" id="predefined" />
                      <Label htmlFor="predefined" className="cursor-pointer flex-1">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" style={{ color: '#3B82F6' }} />
                          <div>
                            <div className="text-white">Pre-defined Questions</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>
                              Standard questions by role and level
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="resume-based" id="resume-based" />
                      <Label htmlFor="resume-based" className="cursor-pointer flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" style={{ color: '#10B981' }} />
                          <div>
                            <div className="text-white">Resume-based Questions</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>
                              Tailored to your experience
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {config.questionSource === 'resume-based' && (
                  <div
                    className="mt-4 p-4 rounded-lg"
                    style={{ backgroundColor: '#374151' }}
                  >
                    <p className="text-sm text-white">
                      <strong>Note:</strong> Resume-based questions will be generated from your profile information.
                      Make sure your profile is up to date for the best experience.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Difficulty Level */}
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
                  <Target className="h-5 w-5" />
                  <span>Interview Level</span>
                </CardTitle>
                <CardDescription style={{ color: '#9CA3AF' }}>
                  Choose the difficulty and duration of your interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.level}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                    setConfig(prev => ({ ...prev, level: value }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" style={{ color: '#10B981' }} />
                            <div>
                              <div className="text-white">Beginner</div>
                              <div className="text-xs" style={{ color: '#9CA3AF' }}>15 minutes</div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: '#10B981',
                              color: 'white'
                            }}
                          >
                            Basic
                          </Badge>
                        </div>
                      </Label>
                    </div>

                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" style={{ color: '#F59E0B' }} />
                            <div>
                              <div className="text-white">Intermediate</div>
                              <div className="text-xs" style={{ color: '#9CA3AF' }}>30 minutes</div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: '#F59E0B',
                              color: 'white'
                            }}
                          >
                            Standard
                          </Badge>
                        </div>
                      </Label>
                    </div>

                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: '#4B5563',
                        backgroundColor: '#374151'
                      }}
                    >
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" style={{ color: '#EF4444' }} />
                            <div>
                              <div className="text-white">Advanced</div>
                              <div className="text-xs" style={{ color: '#9CA3AF' }}>45 minutes</div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: '#EF4444',
                              color: 'white'
                            }}
                          >
                            Expert
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Additional Settings */}
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
                  <Briefcase className="h-5 w-5" />
                  <span>Interview Focus</span>
                </CardTitle>
                <CardDescription style={{ color: '#9CA3AF' }}>
                  Customize your interview to match specific requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Focus Area */}
                <div className="space-y-2">
                  <Label
                    htmlFor="focus-area"
                    style={{ color: '#9CA3AF' }}
                  >
                    Focus Area *
                  </Label>
                  <Select
                    value={config.focusArea}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, focusArea: value }))}
                  >
                    <SelectTrigger
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4B5563',
                        color: '#FFFFFF'
                      }}
                    >
                      <SelectValue placeholder="Select your focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      {focusAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator style={{ backgroundColor: '#4B5563' }} />

                {/* Preparation Time */}
                <div className="space-y-2">
                  <Label
                    htmlFor="prep-time"
                    style={{ color: '#9CA3AF' }}
                  >
                    Preparation Time Before Each Question
                  </Label>
                  <Select
                    value={config.preparationTime.toString()}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, preparationTime: parseInt(value) }))}
                  >
                    <SelectTrigger
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4B5563',
                        color: '#FFFFFF'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No preparation time</SelectItem>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="2">2 minutes</SelectItem>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator style={{ backgroundColor: '#4B5563' }} />

                {/* Specific Topics */}
                <div className="space-y-2">
                  <Label
                    htmlFor="specific-topics"
                    style={{ color: '#9CA3AF' }}
                  >
                    Specific Topics or Keywords (Optional)
                  </Label>
                  <Textarea
                    id="specific-topics"
                    placeholder="Enter specific topics, technologies, or keywords you'd like to focus on (e.g., React, machine learning, agile methodology, etc.)"
                    value={config.specificTopics}
                    onChange={(e) => setConfig(prev => ({ ...prev, specificTopics: e.target.value }))}
                    rows={3}
                    className="transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: '#9CA3AF' }}
                  >
                    This helps tailor questions to your specific interests and requirements
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card
              className="border transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader>
                <CardTitle style={{ color: '#9CA3AF' }}>Session Summary</CardTitle>
                <CardDescription style={{ color: '#9CA3AF' }}>Review your interview configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
                  <div>
                    <strong>Mode:</strong> {config.mode === 'both' ? 'Text & Voice' : config.mode === 'text' ? 'Text Only' : 'Voice Only'}
                  </div>
                  <div>
                    <strong>Questions:</strong> {config.questionSource === 'predefined' ? 'Pre-defined' : 'Resume-based'}
                  </div>
                  <div>
                    <strong>Level:</strong> {config.level.charAt(0).toUpperCase() + config.level.slice(1)} ({getDurationText(config.level)})
                  </div>
                  <div>
                    <strong>Focus Area:</strong> {config.focusArea || 'Not selected'}
                  </div>
                  <div>
                    <strong>Prep Time:</strong> {config.preparationTime === 0 ? 'None' : `${config.preparationTime} minute${config.preparationTime > 1 ? 's' : ''}`}
                  </div>
                  {config.specificTopics && (
                    <div className="md:col-span-2">
                      <strong>Topics:</strong> {config.specificTopics}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-12 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{ backgroundColor: '#10B981'  }}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Interview
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
