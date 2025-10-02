"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Target,
  RotateCcw,
  Play,
  Pause,
  Settings,
  BookOpen,
} from "lucide-react";
import { InteractiveElementRenderer } from "./interactive-elements";
import type { InteractiveWorksheet } from "@/lib/interactive-elements";

interface InteractiveWorksheetViewerProps {
  worksheet: InteractiveWorksheet;
  onComplete?: (results: WorksheetResults) => void;
  className?: string;
}

interface WorksheetResults {
  worksheetId: string;
  totalElements: number;
  completedElements: number;
  correctAnswers: number;
  totalTime: number;
  score: number;
  elementResults: ElementResult[];
}

interface ElementResult {
  elementId: string;
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
}

export function InteractiveWorksheetViewer({
  worksheet,
  onComplete,
  className,
}: InteractiveWorksheetViewerProps) {
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [elementResults, setElementResults] = useState<ElementResult[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentElement = worksheet.elements[currentElementIndex];
  const progress =
    worksheet.elements.length > 0 ? (currentElementIndex / worksheet.elements.length) * 100 : 0;
  const completedElements = elementResults.length;
  const correctAnswers = elementResults.filter((r) => r.isCorrect).length;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted && !isPaused && !isCompleted) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStarted, isPaused, isCompleted]);

  const startWorksheet = () => {
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const pauseWorksheet = () => {
    setIsPaused(!isPaused);
  };

  const handleElementComplete = (elementId: string, isCorrect: boolean, timeSpent: number) => {
    const existingResult = elementResults.find((r) => r.elementId === elementId);

    if (existingResult) {
      // Update existing result
      setElementResults((prev) =>
        prev.map((r) =>
          r.elementId === elementId ? { ...r, isCorrect, timeSpent, attempts: r.attempts + 1 } : r
        )
      );
    } else {
      // Add new result
      setElementResults((prev) => [
        ...prev,
        {
          elementId,
          isCorrect,
          timeSpent,
          attempts: 1,
        },
      ]);
    }

    // Move to next element
    if (currentElementIndex < worksheet.elements.length - 1) {
      setCurrentElementIndex((prev) => prev + 1);
    } else {
      // Worksheet completed
      setIsCompleted(true);
      const totalTime = Date.now() - (startTime || Date.now());
      const score = Math.round((correctAnswers / worksheet.elements.length) * 100);

      const results: WorksheetResults = {
        worksheetId: worksheet.id,
        totalElements: worksheet.elements.length,
        completedElements: elementResults.length + 1,
        correctAnswers: correctAnswers + (isCorrect ? 1 : 0),
        totalTime,
        score,
        elementResults: [
          ...elementResults,
          {
            elementId,
            isCorrect,
            timeSpent,
            attempts: 1,
          },
        ],
      };

      onComplete?.(results);
    }
  };

  const resetWorksheet = () => {
    setCurrentElementIndex(0);
    setElementResults([]);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setCurrentTime(0);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!isStarted) {
    return (
      <div className={className}>
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6" />
              {worksheet.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Worksheet Info */}
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{worksheet.elements.length}</div>
                <div className="text-sm text-gray-600">Elements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {worksheet.metadata.estimatedTime}
                </div>
                <div className="text-sm text-gray-600">Estimated Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {worksheet.metadata.gradeLevel}
                </div>
                <div className="text-sm text-gray-600">Grade Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {worksheet.metadata.difficulty}
                </div>
                <div className="text-sm text-gray-600">Difficulty</div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="mb-2 text-sm font-medium">Skills Covered:</h3>
              <div className="flex flex-wrap gap-2">
                {worksheet.metadata.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            {worksheet.settings && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Settings:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Auto Grade: {worksheet.settings.autoGrade ? "On" : "Off"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-blue-500" />
                    <span>Hints: {worksheet.settings.showHints ? "On" : "Off"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3 text-purple-500" />
                    <span>Retry: {worksheet.settings.allowRetry ? "On" : "Off"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>Progress: {worksheet.settings.showProgress ? "On" : "Off"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Start Button */}
            <div className="text-center">
              <Button onClick={startWorksheet} size="lg" className="px-8 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Worksheet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    const score = Math.round((correctAnswers / worksheet.elements.length) * 100);
    const totalTime = Date.now() - (startTime || Date.now());

    return (
      <div className={className}>
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Worksheet Completed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">{score}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {correctAnswers}/{worksheet.elements.length}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {formatTime(Math.floor(totalTime / 1000))}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{completedElements}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center">
              {score >= 90 && (
                <div className="font-medium text-green-600">
                  Excellent work! You mastered this worksheet!
                </div>
              )}
              {score >= 70 && score < 90 && (
                <div className="font-medium text-blue-600">Good job! You're doing well!</div>
              )}
              {score >= 50 && score < 70 && (
                <div className="font-medium text-yellow-600">Not bad! Keep practicing!</div>
              )}
              {score < 50 && (
                <div className="font-medium text-red-600">Keep trying! Practice makes perfect!</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={resetWorksheet} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => window.print()}>Print Results</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {worksheet.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={pauseWorksheet}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {worksheet.settings.showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Progress: {currentElementIndex + 1} of {worksheet.elements.length}
                </span>
                <span>Time: {formatTime(currentTime)}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Current Element */}
          {currentElement && (
            <InteractiveElementRenderer
              element={currentElement}
              onComplete={handleElementComplete}
              showFeedback={worksheet.settings.autoGrade}
              disabled={isPaused}
            />
          )}

          {/* Element Navigation */}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentElementIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentElementIndex === 0}
            >
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Element {currentElementIndex + 1} of {worksheet.elements.length}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentElementIndex((prev) => Math.min(worksheet.elements.length - 1, prev + 1))
              }
              disabled={currentElementIndex === worksheet.elements.length - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
