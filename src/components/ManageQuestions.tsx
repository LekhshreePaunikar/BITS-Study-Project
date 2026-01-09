// root/src/components/ManageQuestions.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import api from "../utils/api";
import { useEffect } from "react";



interface ManageQuestionsProps {
  username: string;
  onBackToAdminDashboard: () => void;
}

interface Question {
  questionId: number;
  content: string;
  role: string;
  skill: string;
  language: string;
  level: 'easy' | 'medium' | 'hard';
  createdBy: 'Admin' | 'LLM';
  dateTime: string;
  type: 'static' | 'dynamic';
}


interface QuestionForm {
  content: string;
  role: string;
  skill: string;
  language: string;
  level: 'easy' | 'medium' | 'hard';
}

export default function ManageQuestions({ username, onBackToAdminDashboard }: ManageQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  // const [showAddForm, setShowAddForm] = useState(false);
  // const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddForm] = useState(false);
  const [editingQuestion] = useState<Question | null>(null);

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    content: '',
    role: '',
    skill: '',
    language: '',
    level: 'easy'
  });

  // Mock questions data
  useEffect(() => {
    console.log("[ManageQuestions] useEffect mounted");
    const fetchQuestions = async () => {
      try {
        const res = await api.get("/questions/admin");
        console.log(
          "[ManageQuestions] questions array:",
          Array.isArray(res.data.questions),
          res.data.questions
        );

        setQuestions(res.data.questions);
      } catch (err) {
        console.error("[ManageQuestions] API ERROR", err);
        console.error("[ManageQuestions] status:", err?.response?.status);
        console.error("[ManageQuestions] data:", err?.response?.data);
        console.error("Failed to load question bank", err);
        toast.error("Failed to load questions from database");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading question bank...
      </div>
    );
  }

  // Role options
  const roleOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'Software Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Mobile Developer',
    'UI/UX Designer'
  ];

  // Skill options
  const skillOptions = [
    'JavaScript Fundamentals',
    'React/Angular/Vue',
    'System Design',
    'Database Management',
    'Algorithm & Data Structures',
    'Software Design Patterns',
    'API Development',
    'Cloud Architecture',
    'Problem Solving',
    'Testing & QA'
  ];

  // Language options
  const languageOptions = ['Python', 'JavaScript', 'Java', 'SQL', 'C++', 'Go', 'TypeScript'];

  const handleFormChange = (field: keyof QuestionForm, value: string) => {
    setQuestionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // // TBR
  //   const handleAddQuestion = () => {
  //     if (!questionForm.content.trim() || !questionForm.role || !questionForm.skill || !questionForm.language) {
  //       toast.error('Please fill in all required fields');
  //       return;
  //     }

  //     const newQuestion: Question = {
  //       id: generateQuestionId(),
  //       content: questionForm.content.trim(),
  //       role: questionForm.role,
  //       skill: questionForm.skill,
  //       language: questionForm.language,
  //       level: questionForm.level,
  //       createdBy: username,
  //       dateTime: new Date().toLocaleString('en-GB', {
  //         day: '2-digit',
  //         month: 'short',
  //         year: 'numeric',
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: true
  //       })
  //     };

  //     setQuestions(prev => [newQuestion, ...prev]);
  //     setQuestionForm({
  //       content: '',
  //       role: '',
  //       skill: '',
  //       language: '',
  //       level: 'easy'
  //     });
  //     setShowAddForm(false);

  //     toast.success('✅ Question added successfully', {
  //       style: {
  //         background: '#10B981',
  //         color: 'white',
  //         border: 'none'
  //       }
  //     });
  //   };

  //   // TBR
  //   const handleEditQuestion = (question: Question) => {
  //     setEditingQuestion(question);
  //     setQuestionForm({
  //       content: question.content,
  //       role: question.role,
  //       skill: question.skill,
  //       language: question.language,
  //       level: question.level
  //     });
  //     setShowAddForm(true);
  //   };

  //   // TBR
  //   const handleUpdateQuestion = () => {
  //     if (!editingQuestion) return;

  //     if (!questionForm.content.trim() || !questionForm.role || !questionForm.skill || !questionForm.language) {
  //       toast.error('Please fill in all required fields');
  //       return;
  //     }

  //     setQuestions(prev =>
  //       prev.map(q =>
  //         q.questionId === editingQuestion.questionId
  //           ? {
  //             ...q,
  //             content: questionForm.content.trim(),
  //             role: questionForm.role,
  //             skill: questionForm.skill,
  //             language: questionForm.language,
  //             level: questionForm.level
  //           }
  //           : q
  //       )
  //     );

  //     setEditingQuestion(null);
  //     setQuestionForm({
  //       content: '',
  //       role: '',
  //       skill: '',
  //       language: '',
  //       level: 'easy'
  //     });
  //     setShowAddForm(false);

  //     toast.success('✅ Question updated successfully', {
  //       style: {
  //         background: '#10B981',
  //         color: 'white',
  //         border: 'none'
  //       }
  //     });
  //   };

  //   // TBR
  //   const handleDeleteQuestion = (questionId: string) => {
  //     setQuestions(prev => prev.filter(q => q.questionId !== questionId));

  //     toast.success('✅ Question deleted successfully', {
  //       style: {
  //         background: '#10B981',
  //         color: 'white',
  //         border: 'none'
  //       }
  //     });
  //   };

  // const handleCancelEdit = () => {
  //   setEditingQuestion(null);
  //   setQuestionForm({
  //     content: '',
  //     role: '',
  //     skill: '',
  //     language: '',
  //     level: 'easy'
  //   });
  //   setShowAddForm(false);
  // };

  const handleCancelEdit = () => {
    toast.info("Cancel disabled for now");
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      easy: '#10B981',
      medium: '#F59E0B',
      hard: '#EF4444'
    };
    const color = colors[level as keyof typeof colors] || colors.easy;

    return (
      <Badge
        className="text-xs px-2 py-1 border-0 text-white"
        style={{ backgroundColor: color }}
      >
        {level.toUpperCase()}
      </Badge>
    );
  };

  // Filter questions based on search
  const filteredQuestions = questions.filter(question =>
    searchTerm === '' ||
    String(question.questionId).includes(searchTerm) ||
    (question.content ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.role ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.skill ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.language ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  console.log(
    "[ManageQuestions] Render questions count:",
    questions.length,
    questions
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>

        {/* Header */}
        <header className="border-b" style={{ backgroundColor: '#1F2937', borderColor: '#374151', }}>
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-3 items-center">
              <div className="flex justify-start">
                <Button variant="outline" onClick={onBackToAdminDashboard}
                  className="hidden md:flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                  style={{ borderColor: '#6B7280', backgroundColor: "rgba(62, 65, 69, 1)", }}>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </div>
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl mb-2 text-white"> Manage Static Question Bank</h1>
              </div>
              <div />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="space-y-6">

            {/* Top Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: '#6B7280' }}
                  />
                  <Input
                    placeholder="Search questions by ID, content, role, skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80 transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={() => toast.info("Add question coming soon")}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105 text-white"
                style={{
                  backgroundColor: '#3B82F6'
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </Button>
            </div>

            {/* Add/Edit Question Form */}
            {showAddForm && (
              <Card
                className="border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151'
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: '#9CA3AF' }}>
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Content */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="question-content"
                      style={{ color: '#9CA3AF' }}
                    >
                      Question Content *
                    </Label>
                    <Textarea
                      id="question-content"
                      placeholder="Enter the question here..."
                      value={questionForm.content}
                      onChange={(e) => handleFormChange('content', e.target.value)}
                      className="min-h-[100px] transition-all duration-200 hover:shadow-md focus:shadow-lg text-white"
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4B5563',
                        color: '#FFFFFF'
                      }}
                      required
                    />
                  </div>

                  {/* Form Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role Dropdown */}
                    <div className="space-y-2">
                      <Label style={{ color: '#9CA3AF' }}>Role *</Label>
                      <Select value={questionForm.role} onValueChange={(value) => handleFormChange('role', value)}>
                        <SelectTrigger
                          style={{
                            backgroundColor: '#374151',
                            borderColor: '#4B5563',
                            color: '#FFFFFF'
                          }}
                        >
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Skill Dropdown */}
                    <div className="space-y-2">
                      <Label style={{ color: '#9CA3AF' }}>Skill *</Label>
                      <Select value={questionForm.skill} onValueChange={(value) => handleFormChange('skill', value)}>
                        <SelectTrigger
                          style={{
                            backgroundColor: '#374151',
                            borderColor: '#4B5563',
                            color: '#FFFFFF'
                          }}
                        >
                          <SelectValue placeholder="Select skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillOptions.map(skill => (
                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Programming Language Radio Buttons */}
                  <div className="space-y-3">
                    <Label style={{ color: '#9CA3AF' }}>Programming Language *</Label>
                    <RadioGroup
                      value={questionForm.language}
                      onValueChange={(value) => handleFormChange('language', value)}
                      className="flex flex-wrap gap-4"
                    >
                      {languageOptions.map(lang => (
                        <div key={lang} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={lang}
                            id={`lang-${lang}`}
                            style={{ borderColor: '#9CA3AF' }}
                          />
                          <Label
                            htmlFor={`lang-${lang}`}
                            className="text-white cursor-pointer"
                          >
                            {lang}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Difficulty Level Pills */}
                  <div className="space-y-3">
                    <Label style={{ color: '#9CA3AF' }}>Difficulty Level</Label>
                    <div className="flex gap-2">
                      {['easy', 'medium', 'hard'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleFormChange('level', level)}
                          className={`px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 ${questionForm.level === level
                            ? 'text-white'
                            : 'border'
                            }`}
                          style={{
                            backgroundColor: questionForm.level === level
                              ? level === 'easy' ? '#10B981' : level === 'medium' ? '#F59E0B' : '#EF4444'
                              : 'transparent',
                            borderColor: questionForm.level !== level ? '#6B7280' : undefined,
                            color: questionForm.level !== level ? '#9CA3AF' : '#FFFFFF'
                          }}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={() => toast.info("Add / Edit functionality coming soon")}
                      className="flex items-center space-x-2 transition-all duration-200 hover:scale-105 text-white"
                      style={{
                        backgroundColor: '#3B82F6'
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{editingQuestion ? 'UPDATE' : 'ADD'}</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => toast.info("Cancel disabled")}
                      className="transition-all duration-200"
                      style={{
                        color: '#9CA3AF',
                        borderColor: '#6B7280',
                        backgroundColor: 'transparent'
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions Table */}
            <Card
              className="border transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: '#9CA3AF' }}>Questions Database</CardTitle>
                  <div className="text-sm" style={{ color: '#9CA3AF' }}>
                    {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className="border-b"
                        style={{
                          borderColor: '#374151',
                          backgroundColor: '#374151'
                        }}
                      >
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Question ID</th>
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Question</th>
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Context</th>
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Level</th>
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Created By</th>
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Date & Time</th>
                        <th className="text-left p-4 text-sm" style={{ color: '#9CA3AF' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.map((question, index) => (
                        <tr
                          key={question.questionId}
                          className="border-b transition-colors duration-200"
                          style={{
                            borderColor: '#374151',
                            backgroundColor: index % 2 === 0 ? 'rgba(55, 65, 81, 0.2)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(55, 65, 81, 0.2)' : 'transparent';
                          }}
                        >
                          <td
                            className="p-4 text-sm"
                            style={{ color: '#9CA3AF', fontFamily: 'monospace' }}
                          >
                            <Tooltip>
                              <TooltipTrigger>
                                <span>{question.questionId}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{question.content}</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="p-4 text-sm text-white max-w-md">
                            {question.content || '—'}
                          </td>
                          <td className="p-4 text-sm text-white">
                            <div className="space-y-1">
                              <div>
                                <span className="text-gray-400">Role:</span>{' '}
                                {question.role || '—'}
                              </div>
                              <div>
                                <span className="text-gray-400">Skill:</span>{' '}
                                {question.skill || '—'}
                              </div>
                              <div>
                                <span className="text-gray-400">Language:</span>{' '}
                                {question.language || '—'}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            {getLevelBadge(question.level)}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {question.createdBy}
                          </td>
                          <td className="p-4 text-sm text-white">
                            <div className="leading-tight">
                              <div>{new Date(question.dateTime).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(question.dateTime).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                toast.info("Edit functionality coming soon");
                              }}

                              className="h-8 w-8 p-0 text-white transition-all duration-200 hover:scale-110"
                              style={{ backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
                                  style={{
                                    color: '#EF4444',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                style={{
                                  backgroundColor: '#1F2937',
                                  borderColor: '#374151'
                                }}
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    Are you sure you want to delete this question?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription style={{ color: '#9CA3AF' }}>
                                    This action cannot be undone. The question will be permanently removed from the database.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    className="transition-all duration-200"
                                    style={{
                                      color: '#9CA3AF',
                                      borderColor: '#6B7280',
                                      backgroundColor: 'transparent'
                                    }}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      toast.info("Delete functionality coming soon");
                                    }}

                                    className="transition-all duration-200 hover:scale-105 text-white"
                                    style={{ backgroundColor: '#EF4444' }}
                                  >
                                    Yes
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredQuestions.map((question) => (
                    <Card
                      key={question.questionId}
                      className="border transition-all duration-200 hover:shadow-lg"
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4B5563'
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-sm"
                            style={{ color: '#9CA3AF', fontFamily: 'monospace' }}
                          >
                            {question.questionId}
                          </span>
                          {getLevelBadge(question.level)}
                        </div>

                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-white">
                            <strong>Role:</strong> {question.role}
                          </p>
                          <p className="text-sm text-white">
                            <strong>Skill:</strong> {question.skill}
                          </p>
                          <p className="text-sm text-white">
                            <strong>Language:</strong> {question.language}
                          </p>
                          <p className="text-sm text-white">
                            <strong>Created by:</strong> {question.createdBy}
                          </p>
                          <p className="text-sm text-white">
                            <strong>Date:</strong> {new Date(question.dateTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-white mt-2">
                            <strong>Question:</strong> {truncateText(question.content, 100)}
                          </p>
                        </div>

                        <div className="flex space-x-2">

                          {question.type === "static" && (<Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info("Edit functionality coming soon");
                            }}

                            className="flex-1 text-white transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: '#3B82F6' }}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>)}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              {question.type === "static" && (<Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 text-white transition-all duration-200 hover:scale-105"
                                style={{ backgroundColor: '#EF4444' }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>)}
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              style={{
                                backgroundColor: '#1F2937',
                                borderColor: '#374151'
                              }}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">
                                  Are you sure you want to delete this question?
                                </AlertDialogTitle>
                                <AlertDialogDescription style={{ color: '#9CA3AF' }}>
                                  This action cannot be undone. The question will be permanently removed from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  className="transition-all duration-200"
                                  style={{
                                    color: '#9CA3AF',
                                    borderColor: '#6B7280',
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    toast.info("Delete functionality coming soon");
                                  }}

                                  className="transition-all duration-200 hover:scale-105 text-white"
                                  style={{ backgroundColor: '#EF4444' }}
                                >
                                  Yes
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}