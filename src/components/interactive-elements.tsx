"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  Eye,
} from "lucide-react";
import type {
  AllInteractiveElements,
  DragDropElement,
  FillBlankElement,
  MultipleChoiceElement,
  AudioElement,
  VideoElement,
  DrawingElement,
} from "@/lib/interactive-elements";

interface InteractiveElementProps {
  element: AllInteractiveElements;
  onComplete: (elementId: string, isCorrect: boolean, timeSpent: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

// Drag and Drop Element
export function DragDropElement({
  element,
  onComplete,
  showFeedback = true,
  disabled = false,
}: InteractiveElementProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<Record<string, string>>({});
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());

  const dragElement = element as DragDropElement;

  const handleDragStart = (e: React.DragEvent, item: string) => {
    if (disabled) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (disabled || !draggedItem) return;

    const newDroppedItems = { ...droppedItems, [zoneId]: draggedItem };
    setDroppedItems(newDroppedItems);
    setDraggedItem(null);

    // Check if correct
    const zone = dragElement.content.dropZones.find((z) => z.id === zoneId);
    const isAnswerCorrect =
      zone?.accepts.includes("correct-answer") && draggedItem === "correct-answer";

    if (isAnswerCorrect) {
      setIsCorrect(true);
      onComplete(element.id, true, Date.now() - startTime);
    } else {
      setIsCorrect(false);
      onComplete(element.id, false, Date.now() - startTime);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Drag & Drop
          {showFeedback &&
            isCorrect !== null &&
            (isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{dragElement.content.question}</p>

        {/* Drag Items */}
        <div className="flex flex-wrap gap-2">
          {dragElement.content.options.map((option) => (
            <div
              key={option}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, option)}
              className={`cursor-move rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all hover:bg-gray-100 ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>

        {/* Drop Zones */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {dragElement.content.dropZones.map((zone) => (
            <div
              key={zone.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, zone.id)}
              className={`min-h-[60px] rounded-lg border-2 border-dashed p-4 text-center transition-all ${
                droppedItems[zone.id]
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              }`}
            >
              <div className="text-sm font-medium text-gray-600">{zone.label}</div>
              {droppedItems[zone.id] && (
                <div className="mt-2 text-sm font-semibold text-green-700">
                  {droppedItems[zone.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && isCorrect !== null && (
          <div
            className={`rounded-lg p-3 ${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {isCorrect ? dragElement.feedback : "Try again! You can do it!"}
          </div>
        )}

        {/* Hint */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            disabled={disabled}
          >
            <HelpCircle className="mr-1 h-4 w-4" />
            Hint
          </Button>
          {showHint && (
            <Badge variant="outline" className="text-xs">
              Drag the correct answer to the answer zone
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Fill in the Blank Element
export function FillBlankElement({
  element,
  onComplete,
  showFeedback = true,
  disabled = false,
}: InteractiveElementProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());

  const fillElement = element as FillBlankElement;

  const handleAnswerChange = (blankId: string, value: string) => {
    if (disabled) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = () => {
    if (disabled) return;

    const allCorrect = fillElement.content.blanks.every(
      (blank) => answers[blank.id]?.toLowerCase() === blank.correctAnswer.toLowerCase()
    );

    setIsCorrect(allCorrect);
    onComplete(element.id, allCorrect, Date.now() - startTime);
  };

  const renderTextWithBlanks = () => {
    const text = fillElement.content.text;
    let blankIndex = 0;

    return text.split("_____").map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < text.split("_____").length - 1 && (
          <Input
            value={answers[fillElement.content.blanks[blankIndex]?.id] || ""}
            onChange={(e) =>
              handleAnswerChange(fillElement.content.blanks[blankIndex].id, e.target.value)
            }
            className="mx-1 inline-block w-24 text-center"
            disabled={disabled}
            placeholder="?"
          />
        )}
        {blankIndex++}
      </React.Fragment>
    ));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✏️ Fill in the Blank
          {showFeedback &&
            isCorrect !== null &&
            (isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">{renderTextWithBlanks()}</div>

        <div className="flex items-center gap-2">
          <Button onClick={checkAnswers} disabled={disabled}>
            Check Answer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            disabled={disabled}
          >
            <HelpCircle className="mr-1 h-4 w-4" />
            Hint
          </Button>
        </div>

        {/* Feedback */}
        {showFeedback && isCorrect !== null && (
          <div
            className={`rounded-lg p-3 ${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {isCorrect ? fillElement.feedback : "Try again! You can do it!"}
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              {fillElement.content.blanks[0]?.hint || "Think about the context of the sentence."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Multiple Choice Element
export function MultipleChoiceElement({
  element,
  onComplete,
  showFeedback = true,
  disabled = false,
}: InteractiveElementProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());

  const choiceElement = element as MultipleChoiceElement;

  const handleOptionSelect = (optionId: string) => {
    if (disabled || isCorrect !== null) return;

    setSelectedOption(optionId);
    const option = choiceElement.content.options.find((opt) => opt.id === optionId);
    const correct = option?.isCorrect || false;

    setIsCorrect(correct);
    onComplete(element.id, correct, Date.now() - startTime);
  };

  const resetQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Multiple Choice
          {showFeedback &&
            isCorrect !== null &&
            (isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium">{choiceElement.content.question}</p>

        <div className="space-y-2">
          {choiceElement.content.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={disabled}
              className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                selectedOption === option.id
                  ? isCorrect
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    selectedOption === option.id
                      ? isCorrect
                        ? "border-green-500 bg-green-500"
                        : "border-red-500 bg-red-500"
                      : "border-gray-300"
                  }`}
                />
                <span>{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && isCorrect !== null && (
          <div
            className={`rounded-lg p-3 ${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {isCorrect ? choiceElement.feedback : "Not quite right. Try again!"}
          </div>
        )}

        {/* Explanation */}
        {isCorrect !== null && choiceElement.content.explanation && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              <Eye className="mr-1 h-4 w-4" />
              {showExplanation ? "Hide" : "Show"} Explanation
            </Button>
            {showExplanation && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-700">{choiceElement.content.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        {isCorrect !== null && (
          <Button variant="outline" size="sm" onClick={resetQuestion} disabled={disabled}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Audio Element
export function AudioElement({ element, disabled = false }: InteractiveElementProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioElement = element as AudioElement;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlayPause = () => {
    if (disabled) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🎵 Audio Exercise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio
          ref={audioRef}
          src={audioElement.content.url}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Audio Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button onClick={togglePlayPause} disabled={disabled} size="sm">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <span className="text-sm text-gray-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleMute} disabled={disabled}>
              {isMuted ? <Volume2 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Transcript */}
        {audioElement.content.transcript && (
          <div className="rounded-lg bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium">Transcript:</h4>
            <p className="text-sm text-gray-700">{audioElement.content.transcript}</p>
          </div>
        )}

        {/* Questions */}
        {audioElement.content.questions && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Questions:</h4>
            {audioElement.content.questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">
                  {index + 1}. {question.question}
                </p>
                <Input placeholder="Your answer..." className="text-sm" disabled={disabled} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Video Element
export function VideoElement({ element, disabled = false }: InteractiveElementProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoElement = element as VideoElement;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlayPause = () => {
    if (disabled) return;

    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🎬 Video Exercise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <video
          ref={videoRef}
          src={videoElement.content.url}
          className="w-full rounded-lg"
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button onClick={togglePlayPause} disabled={disabled} size="sm">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <span className="text-sm text-gray-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="rounded-lg bg-gray-50 p-3">
          <h4 className="mb-1 text-sm font-medium">{videoElement.content.title}</h4>
          {videoElement.content.description && (
            <p className="text-sm text-gray-600">{videoElement.content.description}</p>
          )}
        </div>

        {/* Questions */}
        {videoElement.content.questions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Questions:</h4>
              <Button variant="outline" size="sm" onClick={() => setShowQuestions(!showQuestions)}>
                <Eye className="mr-1 h-4 w-4" />
                {showQuestions ? "Hide" : "Show"} Questions
              </Button>
            </div>

            {showQuestions && (
              <div className="space-y-3">
                {videoElement.content.questions.map((question, index) => (
                  <div key={question.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(question.timestamp)}
                      </Badge>
                      <span className="text-sm font-medium">Question {index + 1}</span>
                    </div>
                    <p className="mb-2 text-sm">{question.question}</p>
                    <Input placeholder="Your answer..." className="text-sm" disabled={disabled} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Drawing Element
export function DrawingElement({ element, onComplete, disabled = false }: InteractiveElementProps) {
  const [currentTool, setCurrentTool] = useState("pen");
  const [brushSize, setBrushSize] = useState(2);
  const [color, setColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState(Date.now());

  const drawingElement = element as DrawingElement;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = drawingElement.content.canvasSize.width;
    canvas.height = drawingElement.content.canvasSize.height;

    // Set default styles
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [drawingElement.content.canvasSize, color, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    // In a real app, you'd save this to a server or local storage
    console.log("Drawing saved:", dataURL);
    onComplete(element.id, true, Date.now() - startTime);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🎨 Drawing Exercise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{drawingElement.content.prompt}</p>

        {/* Drawing Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium">Tool:</label>
            <select
              value={currentTool}
              onChange={(e) => setCurrentTool(e.target.value)}
              className="rounded border px-2 py-1 text-xs"
              disabled={disabled}
            >
              {drawingElement.content.tools.map((tool) => (
                <option key={tool} value={tool}>
                  {tool.charAt(0).toUpperCase() + tool.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <label className="text-xs font-medium">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-16"
              disabled={disabled}
            />
            <span className="text-xs text-gray-600">{brushSize}px</span>
          </div>

          <div className="flex items-center gap-1">
            <label className="text-xs font-medium">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-6 w-8 rounded border"
              disabled={disabled}
            />
          </div>

          <Button variant="outline" size="sm" onClick={clearCanvas} disabled={disabled}>
            Clear
          </Button>

          <Button size="sm" onClick={saveDrawing} disabled={disabled}>
            Save Drawing
          </Button>
        </div>

        {/* Drawing Canvas */}
        <div className="rounded-lg border bg-white p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair rounded border"
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "300px",
              touchAction: "none",
            }}
          />
        </div>

        {/* Sample Image */}
        {drawingElement.content.sampleImage && (
          <div className="rounded-lg bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium">Reference:</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={drawingElement.content.sampleImage}
              alt="Sample drawing"
              className="h-auto max-w-full rounded border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Interactive Element Renderer
export function InteractiveElementRenderer({
  element,
  onComplete,
  showFeedback = true,
  disabled = false,
}: InteractiveElementProps) {
  switch (element.type) {
    case "drag-drop":
      return (
        <DragDropElement
          element={element}
          onComplete={onComplete}
          showFeedback={showFeedback}
          disabled={disabled}
        />
      );
    case "fill-blank":
      return (
        <FillBlankElement
          element={element}
          onComplete={onComplete}
          showFeedback={showFeedback}
          disabled={disabled}
        />
      );
    case "multiple-choice":
      return (
        <MultipleChoiceElement
          element={element}
          onComplete={onComplete}
          showFeedback={showFeedback}
          disabled={disabled}
        />
      );
    case "audio":
      return (
        <AudioElement
          element={element}
          onComplete={onComplete}
          showFeedback={showFeedback}
          disabled={disabled}
        />
      );
    case "video":
      return (
        <VideoElement
          element={element}
          onComplete={onComplete}
          showFeedback={showFeedback}
          disabled={disabled}
        />
      );
    case "drawing":
      return (
        <DrawingElement
          element={element}
          onComplete={onComplete}
          showFeedback={showFeedback}
          disabled={disabled}
        />
      );
    default:
      return <div>Unsupported element type: {(element as AllInteractiveElements).type}</div>;
  }
}
