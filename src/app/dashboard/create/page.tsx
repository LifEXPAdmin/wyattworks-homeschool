"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile-layout";
import { MobilePDFPreview } from "@/components/mobile-pdf-preview";
import { Input } from "@/components/ui/input";
import {
  generateAddition,
  generateSubtraction,
  generateMultiplication,
  generateDivision,
} from "@/lib/generators/math";
import type { MathProblem } from "@/lib/generators/math";
import {
  generateSpellingWords,
  generateVocabularyWords,
  generateWritingPrompts,
} from "@/lib/generators/language-arts";
import type { SpellingWord, VocabularyItem, WritingPrompt } from "@/lib/generators/language-arts";
import { generateScienceProblems } from "@/lib/generators/science";
import type { ScienceProblem, ScienceSubject } from "@/lib/generators/science";
import type { WorksheetConfig } from "@/lib/config";
// import { FontSelector } from "@/components/font-selector";
import { TemplateSelector } from "@/components/template-selector";
// Removed InteractiveWorksheetViewer import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotaDisplay } from "@/components/quota-warning";
// import { BUILT_IN_FONTS, type FontInfo } from "@/lib/fonts";
// import { themeManager } from "@/lib/design-system";
// import { analyticsStorage } from "@/lib/analytics";
// import { SessionRecorder } from "@/components/progress-dashboard";
// import { UsageLimitWarning } from "@/components/subscription-dashboard";
// import { subscriptionManager } from "@/lib/subscription";
// import { worksheetCache, performanceMonitor, offlineManager } from "@/lib/performance";
import type { WorksheetTemplate } from "@/lib/templates";
// Removed InteractiveWorksheetManager import
import { CollaborationManager } from "@/lib/collaboration";
import { AnalyticsManager } from "@/lib/analytics-simple";
import { CollaborationPanel } from "@/components/collaboration";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Users, BarChart3 } from "lucide-react";

type DifficultyLevel = "very_easy" | "easy" | "medium" | "hard" | "very_hard" | "custom";

const DIFFICULTY_RANGES = {
  very_easy: { min: 0, max: 5, label: "Very Easy (0-5)", desc: "Perfect for Pre-K & Kindergarten" },
  easy: { min: 1, max: 10, label: "Easy (1-10)", desc: "Great for Grades K-2" },
  medium: { min: 1, max: 20, label: "Medium (1-20)", desc: "Ideal for Grades 2-4" },
  hard: { min: 10, max: 100, label: "Hard (10-100)", desc: "Challenging for Grades 4-6" },
  very_hard: { min: 50, max: 500, label: "Very Hard (50-500)", desc: "Advanced Grades 6+" },
  custom: { min: 0, max: 0, label: "Custom Range", desc: "Set your own numbers" },
};

const BACKGROUND_TEMPLATES = [
  { id: "none", name: "Plain White", preview: "#ffffff", css: "background: white;" },
  {
    id: "subtle-grid",
    name: "Subtle Grid",
    preview: "#f0f0f0",
    css: "background: white; background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px); background-size: 20px 20px;",
  },
  {
    id: "notebook",
    name: "Notebook Lines",
    preview: "#fef9e7",
    css: "background: #fef9e7; background-image: repeating-linear-gradient(transparent, transparent 29px, #e8b4b4 29px, #e8b4b4 31px);",
  },
  {
    id: "dots",
    name: "Polka Dots",
    preview: "#ffffff",
    css: "background-color: #fff; background-image: radial-gradient(circle, rgba(59, 130, 246, 0.08) 1px, transparent 1px); background-size: 20px 20px;",
  },
  {
    id: "nature",
    name: "Soft Nature",
    preview: "linear-gradient(135deg, #e8f5e9, #fff3e0)",
    css: "background: linear-gradient(135deg, #e8f5e9 0%, #fff8e1 50%, #fce4ec 100%);",
  },
  {
    id: "sky",
    name: "Sky Blue",
    preview: "linear-gradient(180deg, #e3f2fd, #ffffff)",
    css: "background: linear-gradient(180deg, #e3f2fd 0%, #ffffff 40%);",
  },
  {
    id: "warm",
    name: "Warm Sunset",
    preview: "linear-gradient(135deg, #fff9c4, #ffecb3)",
    css: "background: linear-gradient(135deg, #fff9c4 0%, #ffecb3 50%, #ffe0b2 100%);",
  },
  {
    id: "pastel",
    name: "Pastel Rainbow",
    preview: "linear-gradient(90deg, #fce4ec, #e1f5fe)",
    css: "background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #e1f5fe 50%, #e8f5e9 75%, #fff9c4 100%);",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    preview: "linear-gradient(45deg, #e0f7fa, #b3e5fc)",
    css: "background: linear-gradient(45deg, #e0f7fa 0%, #b3e5fc 50%, #81d4fa 100%);",
  },
  {
    id: "forest",
    name: "Forest Green",
    preview: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
    css: "background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);",
  },
  {
    id: "lavender",
    name: "Lavender Dreams",
    preview: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
    css: "background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%);",
  },
  {
    id: "sunset",
    name: "Vibrant Sunset",
    preview: "linear-gradient(135deg, #ffecb3, #ffcc02)",
    css: "background: linear-gradient(135deg, #ffecb3 0%, #ffcc02 50%, #ff8f00 100%);",
  },
  {
    id: "custom",
    name: "Custom Image",
    preview: "linear-gradient(45deg, #f0f0f0, #e0e0e0)",
    css: "background: #f5f5f5;",
  },
];

const FONT_OPTIONS = [
  { id: "Inter", name: "Inter", category: "Modern" },
  { id: "Times New Roman", name: "Times New Roman", category: "Serif" },
  { id: "Arial", name: "Arial", category: "Sans-serif" },
  { id: "Helvetica", name: "Helvetica", category: "Sans-serif" },
  { id: "Georgia", name: "Georgia", category: "Serif" },
  { id: "Verdana", name: "Verdana", category: "Sans-serif" },
  { id: "Comic Sans MS", name: "Comic Sans MS", category: "Casual" },
  { id: "Trebuchet MS", name: "Trebuchet MS", category: "Sans-serif" },
  { id: "Palatino", name: "Palatino", category: "Serif" },
  { id: "Garamond", name: "Garamond", category: "Serif" },
  { id: "Bookman", name: "Bookman", category: "Serif" },
  { id: "Courier New", name: "Courier New", category: "Monospace" },
];

type SubjectType = "math" | "language_arts" | "science";
type MathOperation = "addition" | "subtraction" | "multiplication" | "division";
type LanguageArtsType = "spelling" | "vocabulary" | "writing";
type ScienceType = "biology" | "chemistry" | "physics" | "earth-science";
type GradeLevel = "K" | "1-2" | "3-4" | "5-6" | "7-8" | "9-12";

export default function CreateWorksheet() {
  const [subject, setSubject] = useState<SubjectType>("math");
  const [title, setTitle] = useState("Math Practice Worksheet");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("3-4");
  const [customMin, setCustomMin] = useState(1);
  const [customMax, setCustomMax] = useState(20);
  const [problemCount, setProblemCount] = useState(20);
  const [operation, setOperation] = useState<MathOperation>("addition");
  const [languageArtsType, setLanguageArtsType] = useState<LanguageArtsType>("spelling");
  const [scienceType, setScienceType] = useState<ScienceType>("biology");
  const [writingType, setWritingType] = useState<
    "narrative" | "expository" | "persuasive" | "descriptive" | "mixed"
  >("mixed");
  const [background, setBackground] = useState("none");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [spellingWords, setSpellingWords] = useState<SpellingWord[]>([]);

  // Template and customization states
  const [selectedTemplate, setSelectedTemplate] = useState<WorksheetTemplate | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  const [layout, setLayout] = useState<"standard" | "wide" | "narrow">("standard");
  const [spacing, setSpacing] = useState<"tight" | "normal" | "loose">("normal");
  const [showBorders, setShowBorders] = useState(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [customInstructions, setCustomInstructions] = useState("");
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Removed all interactive worksheet states - now only PDFs

  // Collaboration and analytics states
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [collaborationSession, setCollaborationSession] = useState<string | null>(null);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyItem[]>([]);
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([]);
  const [scienceProblems, setScienceProblems] = useState<ScienceProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [currentTheme, setCurrentTheme] = useState("default");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Listen for theme changes
  React.useEffect(() => {
    const handleThemeChange = (theme: string) => {
      setCurrentTheme(theme);

      // Track theme change
      AnalyticsManager.trackEvent("current-user", "theme_changed", {
        themeId: theme,
        themeName: theme,
      });
    };

    // themeManager.addListener(handleThemeChange);
    // return () => themeManager.removeListener(handleThemeChange);
  }, []);

  const handleSessionComplete = (_completedSessionId: string) => {
    alert(
      "🎉 Session completed! Your progress has been tracked. Check your dashboard for insights!"
    );
  };

  const handleFontSelect = (font: string) => {
    setSelectedFont(font);

    // Track font change
    AnalyticsManager.trackEvent("current-user", "font_changed", {
      fontName: font,
      fontFamily: font,
      fontCategory: "custom",
    });
  };

  const handleTemplateSelect = (template: WorksheetTemplate) => {
    setSelectedTemplate(template);
    setUseTemplate(true);

    // Apply template settings to form
    setSubject(template.subject as SubjectType);
    setTitle(template.name);
    setGradeLevel(template.gradeLevel as GradeLevel);

    // Set difficulty based on template
    if (template.difficulty === "easy") setDifficulty("easy");
    else if (template.difficulty === "medium") setDifficulty("medium");
    else if (template.difficulty === "hard") setDifficulty("hard");

    // Set custom instructions if available
    if (template.description) {
      setCustomInstructions(template.description);
    }
  };

  // Removed interactive worksheet functions

  const handleStartCollaboration = () => {
    const session = CollaborationManager.createSession(
      "worksheet-123",
      title || "Untitled Worksheet",
      "user-123",
      "John Doe",
      "john@example.com"
    );
    setCollaborationSession(session.id);
    setShowCollaboration(true);

    // Track analytics
    AnalyticsManager.trackEvent("user-123", "collaboration_session_joined", {
      sessionId: session.id,
      worksheetId: "worksheet-123",
    });
  };

  const handleGenerate = () => {
    console.log("🚀 Starting generation with:", { subject, operation, difficulty, problemCount });
    setIsGenerating(true);
    const seed = Date.now();
    const startTime = performance.now();

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("⏰ Generation timeout triggered");
      setIsGenerating(false);
      alert(
        "⏱️ Generation is taking longer than expected. Please try:\n\n• Reducing the number of problems\n• Choosing a different subject or difficulty\n• Refreshing the page and trying again\n\nIf the issue persists, please contact support."
      );
    }, 8000); // 8 second timeout

    // Track worksheet creation event
    try {
      AnalyticsManager.trackEvent("current-user", "worksheet_created", {
        subject,
        type:
          subject === "math"
            ? operation
            : subject === "language_arts"
              ? languageArtsType
              : scienceType,
        difficulty: subject === "math" ? difficulty : gradeLevel,
        problemCount:
          subject === "math"
            ? problemCount
            : subject === "language_arts"
              ? languageArtsType === "spelling"
                ? 10
                : languageArtsType === "vocabulary"
                  ? 10
                  : 5
              : 10,
        seed,
      });
      console.log("✅ Analytics tracked successfully");
    } catch (error) {
      console.error("❌ Analytics error:", error);
    }

    // Determine the current type based on subject
    const currentType =
      subject === "math"
        ? operation
        : subject === "language_arts"
          ? languageArtsType
          : subject === "science"
            ? scienceType
            : "unknown";

    // Check cache first (commented out)
    // const cachedContent = worksheetCache.getGeneratedContent(subject, {
    //   type: currentType,
    //   difficulty,
    //   problemCount,
    //   seed,
    //   gradeLevel,
    // });

    // if (cachedContent) {
    //   console.log("Using cached content");
    //   performanceMonitor.recordCacheHit();

    //   // Use cached content
    //   if (subject === "math") {
    //     setProblems(cachedContent as unknown as MathProblem[]);
    //   } else if (subject === "language_arts") {
    //     if (languageArtsType === "spelling")
    //       setSpellingWords(cachedContent as unknown as SpellingWord[]);
    //     else if (languageArtsType === "vocabulary")
    //       setVocabularyWords(cachedContent as unknown as VocabularyItem[]);
    //     else if (languageArtsType === "writing")
    //       setWritingPrompts(cachedContent as unknown as WritingPrompt[]);
    //   } else if (subject === "science") {
    //     setScienceProblems(cachedContent as unknown as ScienceProblem[]);
    //   }

    //   setIsGenerating(false);
    //   // performanceMonitor.endRender(startTime);
    //   return;
    // }

    // performanceMonitor.recordCacheMiss();

    // Reset all content
    setProblems([]);
    setSpellingWords([]);
    setVocabularyWords([]);
    setWritingPrompts([]);
    setScienceProblems([]);

    try {
      if (subject === "math") {
        console.log("Starting math generation:", { operation, difficulty, problemCount, seed });

        const range =
          difficulty === "custom"
            ? { min: customMin, max: customMax }
            : DIFFICULTY_RANGES[difficulty];

        console.log("Using range:", range);

        let generated: MathProblem[] = [];

        switch (operation) {
          case "addition":
            console.log("Generating addition problems...");
            try {
              generated = generateAddition({
                count: problemCount,
                minValue: range.min,
                maxValue: range.max,
                seed,
              });
              console.log("✅ Addition generation successful:", generated.length, "problems");
            } catch (error) {
              console.error("❌ Addition generation failed:", error);
              throw error;
            }
            break;
          case "subtraction":
            console.log("Generating subtraction problems...");
            generated = generateSubtraction({
              count: problemCount,
              minValue: range.min,
              maxValue: range.max,
              seed,
              allowNegativeResults: false,
            });
            break;
          case "multiplication":
            console.log("Generating multiplication problems...");
            // For multiplication, use smaller ranges to keep products reasonable
            const multMax = Math.min(
              range.max,
              difficulty === "very_easy"
                ? 5
                : difficulty === "easy"
                  ? 10
                  : difficulty === "medium"
                    ? 12
                    : difficulty === "hard"
                      ? 15
                      : 20
            );
            generated = generateMultiplication({
              count: problemCount,
              minValue: Math.max(range.min, 2),
              maxValue: multMax,
              seed,
              maxProduct:
                difficulty === "very_easy"
                  ? 25
                  : difficulty === "easy"
                    ? 100
                    : difficulty === "medium"
                      ? 144
                      : difficulty === "hard"
                        ? 225
                        : undefined,
            });
            break;
          case "division":
            console.log("Generating division problems...");
            // For division, keep divisor and quotient in the difficulty range
            const divMax = Math.min(
              range.max,
              difficulty === "very_easy"
                ? 5
                : difficulty === "easy"
                  ? 10
                  : difficulty === "medium"
                    ? 12
                    : difficulty === "hard"
                      ? 15
                      : 20
            );
            generated = generateDivision({
              count: problemCount,
              minValue: Math.max(range.min, 2),
              maxValue: divMax,
              seed,
              requireWholeNumbers: true,
            });
            break;
        }

        console.log("Generated problems:", generated.length, "problems");
        setProblems(generated);
      } else if (subject === "science") {
        const problems = generateScienceProblems(
          scienceType as ScienceSubject,
          problemCount,
          gradeLevel,
          seed
        );
        setScienceProblems(problems);
      } else if (subject === "language_arts") {
        if (languageArtsType === "spelling") {
          const words = generateSpellingWords({
            count: problemCount,
            grade: gradeLevel,
            seed,
          });
          setSpellingWords(words);
        } else if (languageArtsType === "vocabulary") {
          const words = generateVocabularyWords({
            count: Math.min(problemCount, 10),
            grade: gradeLevel,
            seed,
          });
          setVocabularyWords(words);
        } else if (languageArtsType === "writing") {
          const prompts = generateWritingPrompts({
            count: Math.min(problemCount, 5),
            type: writingType,
            seed,
          });
          setWritingPrompts(prompts);
        }
      }
    } catch (error) {
      console.error("Generation error:", error);

      // Provide specific error messages based on the error type
      let errorMessage = "Failed to generate content. Please try different settings.";

      if (error instanceof Error) {
        if (error.message.includes("language_arts")) {
          errorMessage =
            "Language Arts generation failed. Please try:\n\n• Reducing the number of problems\n• Choosing a different grade level\n• Switching to spelling or vocabulary";
        } else if (error.message.includes("science")) {
          errorMessage =
            "Science generation failed. Please try:\n\n• Choosing a different science subject\n• Adjusting the grade level\n• Reducing the number of problems";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Generation timed out. Please try:\n\n• Reducing the number of problems\n• Choosing simpler settings\n• Refreshing the page";
        }
      }

      alert(`❌ ${errorMessage}\n\nIf the issue persists, please contact support.`);
    } finally {
      console.log("🏁 Generation finally block executing");
      // Clear the timeout
      clearTimeout(timeoutId);
      setIsGenerating(false);
      console.log("✅ setIsGenerating(false) called");

      // Cache the generated content
      const contentToCache =
        subject === "math"
          ? problems
          : subject === "language_arts"
            ? languageArtsType === "spelling"
              ? spellingWords
              : languageArtsType === "vocabulary"
                ? vocabularyWords
                : writingPrompts
            : scienceProblems;

      console.log("📦 Content cached:", contentToCache);

      // worksheetCache.cacheGeneratedContent(
      //   subject,
      //   {
      //     type: currentType,
      //     difficulty,
      //     problemCount,
      //     seed,
      //     gradeLevel,
      //   },
      //   contentToCache as unknown as Record<string, unknown>
      // );

      // performanceMonitor.endRender(startTime);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setBackground("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    try {
      const userId = "current-user"; // In a real app, this would come from auth

      // Track export attempt
      AnalyticsManager.trackEvent(userId, "worksheet_exported", {
        subject,
        type:
          subject === "math"
            ? operation
            : subject === "language_arts"
              ? languageArtsType
              : scienceType,
        difficulty: subject === "math" ? difficulty : gradeLevel,
        problemCount:
          subject === "math"
            ? problemCount
            : subject === "language_arts"
              ? languageArtsType === "spelling"
                ? 10
                : languageArtsType === "vocabulary"
                  ? 10
                  : 5
              : 10,
        font: selectedFont,
        theme: currentTheme,
      });

      // Check if we have content to export
      const hasContent =
        problems.length > 0 ||
        spellingWords.length > 0 ||
        vocabularyWords.length > 0 ||
        writingPrompts.length > 0 ||
        scienceProblems.length > 0;

      if (!hasContent) {
        alert("Please generate content first!");
        return;
      }

      // Open the mobile-friendly PDF preview modal
      setShowPDFPreview(true);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export worksheet. Please try again.");
    }
  };

  const selectedBg = BACKGROUND_TEMPLATES.find((t) => t.id === background);

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-4xl font-bold">Create Your Worksheet</h1>
          <p className="text-muted-foreground text-lg">
            Customize, generate, and print beautiful math worksheets in seconds ✨
          </p>

          {/* Mobile Desktop Features Notice */}
          <div className="mx-auto mt-4 max-w-md rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl text-blue-600">💻</div>
              <div className="text-left">
                <h3 className="mb-1 text-sm font-semibold text-blue-800">
                  More Features on Desktop
                </h3>
                <p className="text-xs text-blue-700">
                  Switch to desktop for advanced customization: background themes, fonts, spacing,
                  borders, and more styling options.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Word-like Interface */}
        <div className="flex h-screen flex-col">
          {/* Toolbar - Always visible at top */}
          <div className="border-b bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {/* First Row */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Document Type - PDF Only */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <div className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    📄 PDF Worksheet
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Subject:</span>
                  <Select
                    value={subject}
                    onValueChange={(value) => {
                      setSubject(value as SubjectType);
                      setTitle(
                        value === "math"
                          ? "Math Practice Worksheet"
                          : value === "language_arts"
                            ? "Language Arts Worksheet"
                            : "Science Worksheet"
                      );
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">📐 Math</SelectItem>
                      <SelectItem value="language_arts">📖 Language Arts</SelectItem>
                      <SelectItem value="science">🔬 Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                {subject === "math" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Difficulty:</span>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DIFFICULTY_RANGES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Grade:</span>
                    <Select
                      value={gradeLevel}
                      onValueChange={(value) => setGradeLevel(value as GradeLevel)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Grade" />
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
                )}

                {/* Problems Count */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Problems:</span>
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={problemCount}
                    onChange={(e) => setProblemCount(parseInt(e.target.value) || 20)}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Second Row - Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="homeschool-button"
                >
                  {isGenerating ? "Generating..." : "🎲 Generate"}
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  variant="outline"
                  className="homeschool-button-secondary"
                >
                  {isExporting ? "Creating..." : "📄 Export"}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area - Simplified for Mobile */}
          <div className="flex flex-1 overflow-hidden">
            {/* Mobile-Optimized Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
              <div className="mx-auto max-w-4xl">
                {problems.length === 0 &&
                spellingWords.length === 0 &&
                vocabularyWords.length === 0 &&
                writingPrompts.length === 0 ? (
                  <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">📋</div>
                      <h3 className="mb-2 text-xl font-semibold">
                        Ready to create your worksheet?
                      </h3>
                      <p className="text-gray-600">
                        Configure your settings above and click "Generate"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">✅</div>
                      <h3 className="mb-2 text-xl font-semibold text-green-800">
                        Worksheet Ready!
                      </h3>
                      <p className="mb-4 text-green-600">
                        Your{" "}
                        {problems.length +
                          spellingWords.length +
                          vocabularyWords.length +
                          writingPrompts.length +
                          scienceProblems.length}{" "}
                        problems have been generated.
                      </p>
                      <p className="text-sm text-green-600">
                        Click "📄 Export" above to preview and print your worksheet
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Panel */}
        {showCollaboration && collaborationSession && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white">
              <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
                <h2 className="text-lg font-semibold">Collaboration Session</h2>
                <Button variant="outline" onClick={() => setShowCollaboration(false)}>
                  Close
                </Button>
              </div>
              <div className="p-4">
                <CollaborationPanel
                  sessionId={collaborationSession}
                  userId="user-123"
                  userName="John Doe"
                  userEmail="john@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white">
              <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
                <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
                <Button variant="outline" onClick={() => setShowAnalytics(false)}>
                  Close
                </Button>
              </div>
              <div className="p-4">
                <AnalyticsDashboard userId="user-123" />
              </div>
            </div>
          </div>
        )}

        {/* Mobile PDF Preview Modal */}
        <MobilePDFPreview
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          worksheetData={{
            title: title,
            subtitle: `Grade ${gradeLevel} • ${difficulty || scienceType || languageArtsType}`,
            instructions: customInstructions || "Solve each problem. Show your work.",
            studentName: true,
            date: true,
            problems: [
              ...problems,
              ...spellingWords.map((w) => ({ problem: w.word, answer: w.word })),
              ...vocabularyWords.map((v) => ({ problem: v.word, answer: v.definition })),
              ...writingPrompts.map((p) => ({ problem: p.prompt, answer: "" })),
              ...scienceProblems.map((s) => ({ problem: s.question, answer: s.answer })),
            ],
          }}
          printOptions={{
            background,
            customImage: customImage || undefined,
            selectedFont,
            spacing,
            showBorders,
            gradeLevel,
            difficulty,
            scienceType,
            languageArtsType,
            customInstructions,
          }}
        />
      </div>
    </MobileLayout>
  );
}
