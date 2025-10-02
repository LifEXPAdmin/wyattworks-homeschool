"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Target,
  Trophy,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizPreviewProps {
  onClose: () => void;
}

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    question: "What is 7 + 5?",
    options: ["10", "11", "12", "13", "14", "15"],
    correctAnswer: 2,
    explanation: "7 + 5 = 12",
  },
  {
    id: "2",
    question: "What is 15 - 8?",
    options: ["5", "6", "7", "8", "9", "10"],
    correctAnswer: 2,
    explanation: "15 - 8 = 7",
  },
  {
    id: "3",
    question: "What is 6 × 4?",
    options: ["20", "22", "24", "26", "28", "30"],
    correctAnswer: 2,
    explanation: "6 × 4 = 24",
  },
  {
    id: "4",
    question: "What is 18 ÷ 3?",
    options: ["4", "5", "6", "7", "8", "9"],
    correctAnswer: 2,
    explanation: "18 ÷ 3 = 6",
  },
  {
    id: "5",
    question: "What is 9 + 7?",
    options: ["14", "15", "16", "17", "18", "19"],
    correctAnswer: 2,
    explanation: "9 + 7 = 16",
  },
];

export function InteractiveQuizPreview({ onClose }: QuizPreviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || isPaused || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setQuizCompleted(true);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, isPaused, quizCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizCompleted) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeRemaining(300);
    setIsPaused(false);
    setQuizStarted(false);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === SAMPLE_QUESTIONS[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / SAMPLE_QUESTIONS.length) * 100);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! You're a math master! 🏆";
    if (score >= 80) return "Great job! You're doing well! ⭐";
    if (score >= 70) return "Good work! Keep practicing! 👍";
    if (score >= 60) return "Not bad! Review and try again! 📚";
    return "Keep studying! You'll get there! 💪";
  };

  if (!quizStarted) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-semibold">Interactive Quiz Preview</h3>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="p-6">
            <div className="mb-6 rounded-lg bg-orange-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h4 className="font-semibold">Preview Mode</h4>
              </div>
              <p className="text-sm text-orange-800">
                This is a fully functional preview of our interactive quiz feature. Your answers and
                progress are NOT saved or tracked. This is just for testing!
              </p>
            </div>

            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Math Quiz - Addition & More</h4>
                <Badge variant="outline">Easy • 5 questions • 5 min</Badge>
              </div>
              <p className="text-sm text-blue-800">
                Test your math skills with this interactive quiz featuring multiple choice questions
                and instant feedback.
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  5 math questions covering addition, subtraction, multiplication, and division
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>5-minute timer with pause/resume functionality</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span>Instant scoring and detailed feedback</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-orange-500" />
                <span>Navigate between questions freely</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setQuizStarted(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Preview Quiz
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === SAMPLE_QUESTIONS[index].correctAnswer
    ).length;

    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-semibold">Quiz Complete!</h3>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="p-6">
            <div className="mb-6 rounded-lg bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">Preview Results</h4>
              </div>
              <p className="text-sm text-green-800">
                This is just a preview! Your results are not saved or tracked.
              </p>
            </div>

            <div className="mb-6 text-center">
              <div
                className={`inline-flex items-center rounded-full px-6 py-3 text-3xl font-bold ${
                  score >= 80
                    ? "bg-green-100 text-green-800"
                    : score >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {score}%
              </div>
              <p className="mt-2 text-lg font-semibold">{getScoreMessage(score)}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-500" />
                <div className="text-2xl font-bold">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <XCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
                <div className="text-2xl font-bold">{SAMPLE_QUESTIONS.length - correctAnswers}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleRestart} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = SAMPLE_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / SAMPLE_QUESTIONS.length) * 100;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
              Preview Mode
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">
                Question {currentQuestion + 1} of {SAMPLE_QUESTIONS.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">{question.question}</h3>
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                    className={`h-12 text-lg ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>
                  Answered: {selectedAnswers.filter((a) => a !== undefined).length}/
                  {SAMPLE_QUESTIONS.length}
                </span>
              </div>
            </div>

            {currentQuestion === SAMPLE_QUESTIONS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="bg-green-600 hover:bg-green-700"
              >
                Finish Quiz
                <Trophy className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
