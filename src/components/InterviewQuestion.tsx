// root/src/components/InterviewQuestion.tsx

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import api from "../utils/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  // DialogTrigger,
} from "./ui/dialog";

import { Progress } from "./ui/progress";
import {
  MessageSquare,
  Mic,
  Send,
  Pause,
  Play,
  SkipForward,
  XCircle,
  Clock,
  Save,
} from "lucide-react";
import { InterviewConfig } from "./InterviewSetup";
interface InterviewConfigWithSession extends InterviewConfig {
  sessionId: number;
}

interface InterviewQuestionProps {
  username: string;
  config: InterviewConfigWithSession;
  onEndInterview: () => void;
  onBackToDashboard: () => void;
}

interface Question {
  questionId: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  type: "static" | "dynamic";
}

export default function InterviewQuestion({
  username,
  config,
  onEndInterview,
  onBackToDashboard,
}: InterviewQuestionProps) {

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEndingInterview, setIsEndingInterview] = useState(false);


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get("/questions/predefined");
        setQuestions(res.data.questions);
      } catch (err) {
        console.error("Failed to load questions", err);
        alert("Failed to load interview questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  const [timeRemaining, setTimeRemaining] = useState(150); // Default 150 seconds
  const [isPaused, setIsPaused] = useState(false);


  const [answerMode, setAnswerMode] = useState<
    "text" | "voice" | null
  >(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  const timerRef = useRef<number | null>(null);
  const autoSaveRef = useRef<number | null>(null);

  // Initialize timer based on config level
  useEffect(() => {
    const duration =
      config.level === "easy"
        ? 15 * 60
        : config.level === "medium"
          ? 30 * 60
          : 45 * 60;
    setTimeRemaining(duration);
  }, [config.level]);

  // Timer logic
  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-end interview when time runs out
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, timeRemaining]);

  // Auto-save logic
  useEffect(() => {
    if (textAnswer.trim()) {
      autoSaveRef.current = setInterval(() => {
        // Mock auto-save
        setAutoSaveStatus("Auto-saved");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      }, 30000);
    }

    return () => {
      if (autoSaveRef.current)
        clearInterval(autoSaveRef.current);
    };
  }, [textAnswer]);

  // Prevent User from reloading the site mid-interview
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isEndingInterview) return;
      event.preventDefault();
      (event as any).returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = async () => {
    if (answerMode === "text" && !textAnswer.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    const currentQ = questions[currentQuestionIndex];

    try {

      const answerRes = await api.post(
        `/interview/${config.sessionId}/answer`,
        {
          questionId: currentQ.questionId,
          userAnswer: textAnswer
        }
      );

      console.log("Answer Inserted:", answerRes.data);
      const answerId = answerRes.data.answer_id;


      // Save SESSION HISTORY (IDs only)
      await api.post(
        `/interview/${config.sessionId}/history`,
        {
          questionId: currentQ.questionId,
          answerId: answerId
        }
      );

      console.log("Session History Inserted:", {
        sessionId: config.sessionId,
        questionId: currentQ.questionId,
        answerId
      });


    } catch (err) {
      console.error("Failed to save answer:", err);
      alert("Failed to save answer");
      return; // do NOT move to next question if save fails
    }


    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTextAnswer("");
      setAnswerMode(null);
      setTimeRemaining(
        config.level === "easy"
          ? 15 * 60
          : config.level === "medium"
            ? 30 * 60
            : 45 * 60
      );

    } else {
      handleEndInterview();
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTextAnswer("");
      setAnswerMode(null);
      setTimeRemaining(
        config.level === "easy"
          ? 15 * 60
          : config.level === "medium"
            ? 30 * 60
            : 45 * 60
      );

    } else {
      handleEndInterview();
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleVoiceToggle = () => {
    if (answerMode === "voice") {
      setIsRecording(!isRecording);
      // Mock voice recording logic
      if (!isRecording) {
        console.log("Starting voice recording...");
      } else {
        console.log("Stopping voice recording...");
      }
    }
  };

  const handleEndInterview = () => {
    setEndDialogOpen(true);
  };


  const confirmEndInterview = async () => {
    setIsEndingInterview(true);
    try {
      console.log("Ending interview session:", config.sessionId);
      // console.log("FINAL answers being sent:", answers);

      await api.post("/interview/end", {
        session_id: config.sessionId,
      });

      console.log("Interview session ended successfully");

    } catch (error) {
      console.error("Failed to end interview:", error);
    } finally {
      // cleanup timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);

      onEndInterview();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const difficulty = currentQuestion?.difficulty;

  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading interview questions...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No questions available
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
          <div className="flex items-center justify-center">

            <div className="text-center">
              <h1 className="text-white">
                Interview Question Page
              </h1>
            </div>

          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-4">
            <p
              className="mb-2"
              style={{ color: '#9CA3AF' }}
            >
              Question {currentQuestionIndex + 1} of{" "}
              {questions.length}
            </p>
            <Progress
              value={progressPercentage}
              className="w-full max-w-md mx-auto"
              style={{ backgroundColor: '#374151' }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto px-6 py-8 ${endDialogOpen ? "pointer-events-none select-none" : "pointer-events-auto"
        }`}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question Display */}
          <Card
            className="border transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent className="p-8">
              <div className="min-h-[120px] flex items-center justify-center">
                <p className="text-center text-xl leading-relaxed text-white">
                  {currentQuestion.text}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty & Timer Row */}
          <div className="flex items-center justify-between">
            {/* Difficulty Display (Auto, not editable) */}
            <div className="flex items-center space-x-2">
              <Label style={{ color: '#9CA3AF' }}>Difficulty:</Label>
              <Badge
                className={`capitalize text-white px-2 py-1 rounded ${difficulty === "easy"
                  ? "bg-green-600"
                  : difficulty === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-600"
                  }`}
                style={{
                  backgroundColor:
                    difficulty === "easy" ? '#10B981' :
                      difficulty === "medium" ? '#F59E0B' : '#EF4444'
                }}
              >
                {difficulty}
              </Badge>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock
                className="h-4 w-4"
                style={{ color: '#9CA3AF' }}
              />
              <Badge
                className={`text-sm ${timeRemaining < 60
                  ? "text-white"
                  : "text-white"
                  }`}
                style={{
                  backgroundColor: timeRemaining < 60 ? '#EF4444' : '#6B7280'
                }}
              >
                ~{formatTime(timeRemaining)}
              </Badge>
              {isPaused && (
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    borderColor: '#6B7280',
                    color: '#9CA3AF',
                    backgroundColor: 'transparent'
                  }}
                >
                  PAUSED
                </Badge>
              )}
            </div>
          </div>

          {/* Answer Mode Selection */}
          {!answerMode && (
            <div className="text-center space-y-4">
              <h3 className="text-white">
                Choose your answer mode:
              </h3>
              <div className="flex justify-center space-x-8">
                <Card
                  className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 w-48 h-32 border"
                  style={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151'
                  }}
                  onClick={() => setAnswerMode("text")}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full">
                    <MessageSquare className="h-8 w-8 mb-2" style={{ color: '#3B82F6' }} />
                    <p className="text-white">Text Response</p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 w-48 h-32 border"
                  style={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151'
                  }}
                  // NOTE: Voice mode is disabled for now
                  // onClick={() => setAnswerMode("voice")}
                  onClick={undefined}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full">
                    <Mic className="h-8 w-8 mb-2" style={{ color: '#10B981' }} />
                    <p className="text-white text-center">
                      Voice Response <span className="block text-sm" style={{ color: '#10B981' }}>(Coming Soon)</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Answer Input Area */}
          {answerMode === "text" && (
            <Card
              className="border transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardContent className="p-6">
                <Label
                  htmlFor="answer-text"
                  style={{ color: '#9CA3AF' }}
                >
                  Your Answer:
                </Label>
                <Textarea
                  id="answer-text"
                  placeholder="Type your answer here..."
                  value={textAnswer}
                  onChange={(e) =>
                    setTextAnswer(e.target.value)
                  }
                  rows={8}
                  className="mt-2 text-white"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4B5563',
                    color: '#FFFFFF'
                  }}
                />
                {autoSaveStatus && (
                  <div
                    className="flex items-center space-x-1 mt-2 text-sm"
                    style={{ color: '#10B981' }}
                  >
                    <Save className="h-3 w-3" />
                    <span>{autoSaveStatus}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {answerMode === "voice" && (
            <Card
              className="border transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: '#1F2937',
                borderColor: '#374151'
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleVoiceToggle}
                      className={`w-32 h-32 rounded-full transition-all duration-200 hover:shadow-lg text-white ${isRecording ? 'animate-pulse' : ''
                        }`}
                      style={{
                        backgroundColor: isRecording ? '#EF4444' : '#3B82F6'
                      }}
                    >
                      <Mic
                        className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
                      />
                    </Button>
                  </div>
                  <p style={{ color: '#9CA3AF' }}>
                    {isRecording
                      ? "Recording... Click to stop"
                      : "Click to start recording your answer"}
                  </p>
                  {isRecording && (
                    <Badge
                      className="animate-pulse text-white"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      ● RECORDING
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {answerMode && (
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleSubmitAnswer}
                className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Send className="h-4 w-4" />
                <span>Submit</span>
              </Button>

              <Button
                variant="outline"
                onClick={handlePauseResume}
                className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{
                  borderColor: '#6B7280',
                  color: '#9CA3AF',
                  backgroundColor: 'transparent'
                }}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleSkipQuestion}
                className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <SkipForward className="h-4 w-4" />
                <span>Skip Question</span>
              </Button>

              <Button
                onClick={handleEndInterview}
                className="flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white"
                style={{ backgroundColor: '#EF4444' }}
              >
                <XCircle className="h-4 w-4" />
                <span>End Interview</span>
              </Button>
            </div>
          )}

          {/* Auto-save Message */}
          <div className="text-center">
            <p
              className="text-sm"
              style={{ color: '#9CA3AF' }}
            >
              Auto-save every 30s
            </p>
          </div>
        </div>
      </main>

      {/* End Interview Confirmation Dialog */}
      <Dialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
      >
        <DialogContent
          style={{
            backgroundColor: '#1F2937',
            borderColor: '#374151'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">End Interview</DialogTitle>
            <DialogDescription style={{ color: '#9CA3AF' }}>
              Are you sure you want to end the interview? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaused(false);
                }}
              >
                Continue Interview
              </Button>
            </DialogClose>
            <Button
              onClick={confirmEndInterview}
              className="text-white"
              style={{ backgroundColor: '#EF4444' }}
            >
              Yes, End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}