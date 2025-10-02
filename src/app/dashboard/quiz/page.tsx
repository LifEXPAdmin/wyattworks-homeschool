"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InteractiveWorksheetViewer } from "@/components/interactive-worksheet-viewer";
import { InteractiveWorksheetManager, type InteractiveWorksheet } from "@/lib/interactive-elements";
import { AnalyticsManager } from "@/lib/analytics-simple";
import {
  Clock,
  Target,
  Trophy,
  BookOpen,
  Brain,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
} from "lucide-react";

type SubjectType = "math" | "language_arts" | "science";
type DifficultyLevel = "easy" | "medium" | "hard";
type GradeLevel = "K" | "1-2" | "3-4" | "5-6" | "7-8" | "9-12";

const DIFFICULTY_CONFIGS = {
  easy: {
    label: "Easy",
    desc: "Perfect for beginners",
    timeLimit: 300, // 5 minutes
    points: 10,
  },
  medium: {
    label: "Medium",
    desc: "Good challenge",
    timeLimit: 600, // 10 minutes
    points: 15,
  },
  hard: {
    label: "Hard",
    desc: "Expert level",
    timeLimit: 900, // 15 minutes
    points: 20,
  },
};

export default function QuizPage() {
  const [subject, setSubject] = useState<SubjectType>("math");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("1-2");
  const [questionCount, setQuestionCount] = useState(10);
  const [quiz, setQuiz] = useState<InteractiveWorksheet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    totalPoints: number;
    timeSpent: number;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);

    try {
      // Generate quiz based on subject and difficulty
      const elementTypes = [];
      const timeLimit = DIFFICULTY_CONFIGS[difficulty].timeLimit;

      if (subject === "math") {
        elementTypes.push("drag-drop", "multiple-choice");
      } else if (subject === "language_arts") {
        elementTypes.push("fill-blank", "multiple-choice");
      } else if (subject === "science") {
        elementTypes.push("multiple-choice", "drag-drop");
      }

      const generatedQuiz = InteractiveWorksheetManager.createInteractiveWorksheet(
        `${subject.charAt(0).toUpperCase() + subject.slice(1)} Knowledge Test`,
        subject,
        gradeLevel,
        difficulty,
        elementTypes,
        questionCount
      );

      // Add time limit to quiz settings
      generatedQuiz.settings = {
        ...generatedQuiz.settings,
        timeLimit,
        autoGrade: true,
        showHints: false,
        showProgress: true,
        allowRetry: true,
      };

      setQuiz(generatedQuiz);
      setShowQuiz(true);

      // Track quiz creation
      AnalyticsManager.trackEvent("current-user", "quiz_created", {
        subject,
        difficulty,
        gradeLevel,
        questionCount,
        timeLimit,
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (results: { score: number; totalPoints: number }) => {
    const timeSpent = Math.floor(Math.random() * 600); // Mock time spent

    const finalResults = {
      score: results.score,
      totalPoints: results.totalPoints,
      timeSpent,
      correctAnswers: Math.round((results.score / 100) * results.totalPoints),
      totalQuestions: results.totalPoints,
    };

    setQuizResults(finalResults);
    setShowQuiz(false);

    // Track quiz completion
    AnalyticsManager.trackEvent("current-user", "quiz_completed", {
      subject,
      difficulty,
      gradeLevel,
      score: results.score,
      timeSpent,
      correctAnswers: finalResults.correctAnswers,
      totalQuestions: finalResults.totalQuestions,
    });
  };

  const handleStartNewQuiz = () => {
    setQuiz(null);
    setQuizResults(null);
    setShowQuiz(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! You're a master! 🏆";
    if (score >= 80) return "Great job! You're doing well! ⭐";
    if (score >= 70) return "Good work! Keep practicing! 👍";
    if (score >= 60) return "Not bad! Review and try again! 📚";
    return "Keep studying! You'll get there! 💪";
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-4">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Test Your Knowledge</h1>
          <p className="text-lg text-gray-600">
            Challenge yourself with timed quizzes and see how well you know your subjects! 🧠
          </p>
        </div>

        {!showQuiz && !quizResults && (
          <div className="mx-auto max-w-2xl">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Quiz Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Subject</label>
                  <Select
                    value={subject}
                    onValueChange={(value) => setSubject(value as SubjectType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">📐 Math</SelectItem>
                      <SelectItem value="language_arts">📖 Language Arts</SelectItem>
                      <SelectItem value="science">🔬 Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Level */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Grade Level</label>
                  <Select
                    value={gradeLevel}
                    onValueChange={(value) => setGradeLevel(value as GradeLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K">Kindergarten</SelectItem>
                      <SelectItem value="1-2">Grades 1-2</SelectItem>
                      <SelectItem value="3-4">Grades 3-4</SelectItem>
                      <SelectItem value="5-6">Grades 5-6</SelectItem>
                      <SelectItem value="7-8">Grades 7-8</SelectItem>
                      <SelectItem value="9-12">Grades 9-12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Difficulty</label>
                  <Select
                    value={difficulty}
                    onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex w-full items-center justify-between">
                            <span>{config.label}</span>
                            <Badge variant="outline" className="ml-2">
                              {formatTime(config.timeLimit)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    {DIFFICULTY_CONFIGS[difficulty].desc} •{" "}
                    {formatTime(DIFFICULTY_CONFIGS[difficulty].timeLimit)} time limit
                  </p>
                </div>

                {/* Question Count */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Number of Questions</label>
                  <Input
                    type="number"
                    min="5"
                    max="25"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Choose between 5-25 questions for your quiz
                  </p>
                </div>

                {/* Quiz Info */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">Quiz Features:</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timed quiz with countdown timer
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Instant grading and feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Score tracking and progress
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Interactive questions with drag & drop
                    </li>
                  </ul>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 py-3 font-semibold text-white hover:from-purple-600 hover:to-blue-600"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz Viewer */}
        {showQuiz && quiz && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{quiz.title}</h2>
                  <p className="text-purple-100">
                    {DIFFICULTY_CONFIGS[difficulty].label} • {questionCount} questions •{" "}
                    {formatTime(DIFFICULTY_CONFIGS[difficulty].timeLimit)} time limit
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white text-purple-600">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatTime(DIFFICULTY_CONFIGS[difficulty].timeLimit)}
                </Badge>
              </div>
            </div>
            <InteractiveWorksheetViewer worksheet={quiz} onComplete={handleQuizComplete} />
          </div>
        )}

        {/* Quiz Results */}
        {quizResults && (
          <div className="mx-auto max-w-2xl">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                <p className="text-gray-600">Here's how you did:</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center rounded-full px-6 py-3 text-3xl font-bold ${getScoreColor(quizResults.score)}`}
                  >
                    {quizResults.score}%
                  </div>
                  <p className="mt-2 text-lg font-semibold">{getScoreMessage(quizResults.score)}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-500" />
                    <div className="text-2xl font-bold">{quizResults.correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <XCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
                    <div className="text-2xl font-bold">
                      {quizResults.totalQuestions - quizResults.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <BookOpen className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                    <div className="text-2xl font-bold">{quizResults.totalQuestions}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <Clock className="mx-auto mb-2 h-6 w-6 text-purple-500" />
                    <div className="text-2xl font-bold">{formatTime(quizResults.timeSpent)}</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {quizResults.correctAnswers}/{quizResults.totalQuestions}
                    </span>
                  </div>
                  <Progress
                    value={(quizResults.correctAnswers / quizResults.totalQuestions) * 100}
                    className="h-3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartNewQuiz}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New Quiz
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/dashboard/create")}
                    className="flex-1"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create Worksheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
