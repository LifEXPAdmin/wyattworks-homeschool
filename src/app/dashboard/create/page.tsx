"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FontSelector } from "@/components/font-selector";
import { TemplateSelector } from "@/components/template-selector";
import { InteractiveWorksheetViewer } from "@/components/interactive-worksheet-viewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotaDisplay, UpgradePrompt } from "@/components/quota-warning";
import { BUILT_IN_FONTS, type FontInfo } from "@/lib/fonts";
import { themeManager } from "@/lib/design-system";
import { analyticsStorage } from "@/lib/analytics";
import { SessionRecorder } from "@/components/progress-dashboard";
import { UsageLimitWarning } from "@/components/subscription-dashboard";
import { subscriptionManager } from "@/lib/subscription";
import { worksheetCache, performanceMonitor, offlineManager } from "@/lib/performance";
import type { WorksheetTemplate } from "@/lib/templates";
import { InteractiveWorksheetManager, type InteractiveWorksheet } from "@/lib/interactive-elements";

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
    preview: "linear-gradient(#f0f0f0, #f0f0f0)",
    css: "background: white; background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px); background-size: 20px 20px;",
  },
  {
    id: "notebook",
    name: "Notebook Lines",
    preview: "linear-gradient(#e3f2fd, #e3f2fd)",
    css: "background: #fef9e7; background-image: repeating-linear-gradient(transparent, transparent 29px, #e8b4b4 29px, #e8b4b4 31px);",
  },
  {
    id: "dots",
    name: "Polka Dots",
    preview: "radial-gradient(circle, #ddd 10%, transparent 10%)",
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
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  // Interactive worksheet states
  const [worksheetType, setWorksheetType] = useState<"traditional" | "interactive">("traditional");
  const [interactiveWorksheet, setInteractiveWorksheet] = useState<InteractiveWorksheet | null>(
    null
  );
  const [showInteractiveViewer, setShowInteractiveViewer] = useState(false);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyItem[]>([]);
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([]);
  const [scienceProblems, setScienceProblems] = useState<ScienceProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFont, setSelectedFont] = useState<FontInfo>(BUILT_IN_FONTS[0]);
  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentTheme());

  // Listen for theme changes
  React.useEffect(() => {
    const handleThemeChange = (theme: typeof currentTheme) => {
      setCurrentTheme(theme);

      // Track theme change
      analyticsStorage.trackEvent({
        userId: "current-user",
        studentId: "current-student",
        eventType: "theme_changed",
        data: {
          themeId: theme.id,
          themeName: theme.name,
        },
      });
    };

    themeManager.addListener(handleThemeChange);
    return () => themeManager.removeListener(handleThemeChange);
  }, []);

  const handleSessionComplete = (_completedSessionId: string) => {
    alert(
      "🎉 Session completed! Your progress has been tracked. Check your dashboard for insights!"
    );
  };

  const handleFontSelect = (font: FontInfo) => {
    setSelectedFont(font);

    // Track font change
    analyticsStorage.trackEvent({
      userId: "current-user",
      studentId: "current-student",
      eventType: "font_changed",
      data: {
        fontName: font.name,
        fontFamily: font.family,
        fontCategory: font.category,
      },
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

  const handleCreateInteractiveWorksheet = () => {
    const elementTypes = [];

    // Add element types based on subject
    if (subject === "math") {
      elementTypes.push("drag-drop", "multiple-choice");
    } else if (subject === "language_arts") {
      elementTypes.push("fill-blank", "multiple-choice");
    } else if (subject === "science") {
      elementTypes.push("multiple-choice", "drag-drop");
    }

    const interactiveWS = InteractiveWorksheetManager.createInteractiveWorksheet(
      title,
      subject,
      gradeLevel,
      difficulty,
      elementTypes,
      problemCount
    );

    setInteractiveWorksheet(interactiveWS);
    setShowInteractiveViewer(true);
  };

  const handleInteractiveWorksheetComplete = (results: { score: number }) => {
    console.log("Interactive worksheet completed:", results);
    // In a real app, you'd save results to database
    alert(`Worksheet completed! Score: ${results.score}%`);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    const seed = Date.now();
    const startTime = performanceMonitor.startRender();

    // Track worksheet creation event
    analyticsStorage.trackEvent({
      userId: "current-user",
      studentId: "current-student",
      eventType: "worksheet_created",
      data: {
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
      },
    });

    // Determine the current type based on subject
    const currentType =
      subject === "math"
        ? operation
        : subject === "language_arts"
          ? languageArtsType
          : subject === "science"
            ? scienceType
            : "unknown";

    // Check cache first
    const cachedContent = worksheetCache.getGeneratedContent(subject, {
      type: currentType,
      difficulty,
      problemCount,
      seed,
      gradeLevel,
    });

    if (cachedContent) {
      console.log("Using cached content");
      performanceMonitor.recordCacheHit();

      // Use cached content
      if (subject === "math") {
        setProblems(cachedContent as unknown as MathProblem[]);
      } else if (subject === "language_arts") {
        if (languageArtsType === "spelling")
          setSpellingWords(cachedContent as unknown as SpellingWord[]);
        else if (languageArtsType === "vocabulary")
          setVocabularyWords(cachedContent as unknown as VocabularyItem[]);
        else if (languageArtsType === "writing")
          setWritingPrompts(cachedContent as unknown as WritingPrompt[]);
      } else if (subject === "science") {
        setScienceProblems(cachedContent as unknown as ScienceProblem[]);
      }

      setIsGenerating(false);
      performanceMonitor.endRender(startTime);
      return;
    }

    performanceMonitor.recordCacheMiss();

    // Reset all content
    setProblems([]);
    setSpellingWords([]);
    setVocabularyWords([]);
    setWritingPrompts([]);
    setScienceProblems([]);

    try {
      if (subject === "math") {
        const range =
          difficulty === "custom"
            ? { min: customMin, max: customMax }
            : DIFFICULTY_RANGES[difficulty];
        let generated: MathProblem[] = [];

        switch (operation) {
          case "addition":
            generated = generateAddition({
              count: problemCount,
              minValue: range.min,
              maxValue: range.max,
              seed,
            });
            break;
          case "subtraction":
            generated = generateSubtraction({
              count: problemCount,
              minValue: range.min,
              maxValue: range.max,
              seed,
              allowNegativeResults: false,
            });
            break;
          case "multiplication":
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
      alert("Failed to generate content. Please try different settings.");
    } finally {
      setIsGenerating(false);

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

      worksheetCache.cacheGeneratedContent(
        subject,
        {
          type: currentType,
          difficulty,
          problemCount,
          seed,
          gradeLevel,
        },
        contentToCache as unknown as Record<string, unknown>
      );

      performanceMonitor.endRender(startTime);
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
    const userId = "current-user"; // In a real app, this would come from auth

    // Track export attempt
    analyticsStorage.trackEvent({
      userId,
      studentId: "current-student",
      eventType: "worksheet_exported",
      data: {
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
        font: selectedFont.name,
        theme: currentTheme.id,
      },
    });

    // Determine the current type based on subject
    const currentType =
      subject === "math"
        ? operation
        : subject === "language_arts"
          ? languageArtsType
          : subject === "science"
            ? scienceType
            : "unknown";

    // Check if offline
    if (offlineManager.canWorkOffline()) {
      // Add to pending actions for later sync
      offlineManager.addPendingAction({
        type: "export_worksheet",
        data: {
          subject,
          type: currentType,
          difficulty,
          problemCount,
          gradeLevel,
          problems,
          spellingWords,
          vocabularyWords,
          writingPrompts,
          scienceProblems,
        },
      });

      alert(
        "📡 You're offline! Your worksheet export has been queued and will sync when you're back online."
      );
      return;
    }

    // Check usage limits
    if (!subscriptionManager.canPerformAction(userId, "exportsPerMonth")) {
      alert(
        "You've reached your monthly export limit. Please upgrade your plan to continue exporting worksheets."
      );
      return;
    }

    if (!subscriptionManager.canPerformAction(userId, "worksheetsPerMonth")) {
      alert(
        "You've reached your monthly worksheet limit. Please upgrade your plan to create more worksheets."
      );
      return;
    }

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

    setIsExporting(true);

    const configDifficulty =
      difficulty === "very_easy" || difficulty === "very_hard" || difficulty === "custom"
        ? "medium"
        : difficulty;

    const config: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {
        problemCount,
        difficulty: configDifficulty,
        showAnswerKey: false,
      },
      layout: {
        orientation: "portrait",
        pageSize: "letter",
      },
      seed: Date.now(),
    };

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          title,
          subtitle: `${operation.charAt(0).toUpperCase() + operation.slice(1)} - ${DIFFICULTY_RANGES[difficulty].label}`,
          instructions: "Solve each problem. Show your work.",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Export failed:", result);
        if (result.paywall) {
          alert(
            `Quota exceeded! You've used ${result.quota?.used}/${result.quota?.limit} exports this month. Please upgrade to continue.`
          );
        } else {
          const errorMsg = result.message || result.error || "Failed to export";
          const details = result.details
            ? `\n\nDetails: ${JSON.stringify(result.details, null, 2)}`
            : "";
          alert(`Error: ${errorMsg}${details}`);
        }
        return;
      }

      const selectedBg = BACKGROUND_TEMPLATES.find((t) => t.id === background);
      const bgStyle =
        background === "custom" && customImage
          ? `background-image: url('${customImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
          : selectedBg?.css || "";

      // Generate PDF and download it
      const contentData =
        subject === "math"
          ? {
              problems,
              title,
              subtitle: `${operation.charAt(0).toUpperCase() + operation.slice(1)} - ${DIFFICULTY_RANGES[difficulty].label}`,
            }
          : subject === "science"
            ? {
                problems: scienceProblems,
                title,
                subtitle: `${scienceType.charAt(0).toUpperCase() + scienceType.slice(1)} - Grade ${gradeLevel}`,
              }
            : subject === "language_arts"
              ? { spellingWords, vocabularyWords, writingPrompts, title }
              : {};

      // Open print window instead of generating PDF client-side
      const printWindow = window.open("", "_blank");

      if (printWindow) {
        printWindow.document.write(
          generatePrintHTML(
            subject,
            result.data || contentData,
            bgStyle,
            selectedFont,
            currentTheme as unknown as { colors: Record<string, string> }
          )
        );
        printWindow.document.close();
        alert(
          "✅ Worksheet Ready!\n\nA new window has opened with your worksheet.\n\nClick the 'Print Worksheet' button and use your browser's print dialog to:\n• Save as PDF\n• Print directly"
        );

        // Track usage
        subscriptionManager.incrementUsage(userId, "exportsPerMonth");
        subscriptionManager.incrementUsage(userId, "worksheetsPerMonth");
      } else {
        alert(
          "Popup blocked! Please allow popups for this site, then try again.\n\nOr click OK and I'll show the worksheet on this page instead."
        );
        document.body.innerHTML = generatePrintHTML(
          subject,
          result.data || contentData,
          bgStyle,
          selectedFont,
          currentTheme as unknown as { colors: Record<string, string> }
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export worksheet. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedBg = BACKGROUND_TEMPLATES.find((t) => t.id === background);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <nav className="border-b bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <Link href="/" className="text-primary text-2xl font-bold">
                <span className="flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  <span>Astra Academy</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">← Dashboard</Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-4xl font-bold">Create Your Worksheet</h1>
          <p className="text-muted-foreground text-lg">
            Customize, generate, and print beautiful math worksheets in seconds ✨
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Template Selection */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">📋 Choose Template</CardTitle>
                <CardDescription>
                  Start with a pre-made template or create from scratch
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={useTemplate ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseTemplate(true)}
                      >
                        Use Template
                      </Button>
                      <Button
                        variant={!useTemplate ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseTemplate(false)}
                      >
                        Create from Scratch
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={worksheetType === "traditional" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWorksheetType("traditional")}
                      >
                        📄 Traditional PDF
                      </Button>
                      <Button
                        variant={worksheetType === "interactive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWorksheetType("interactive")}
                      >
                        🎮 Interactive
                      </Button>
                    </div>
                  </div>

                  {useTemplate && (
                    <TemplateSelector
                      onTemplateSelect={handleTemplateSelect}
                      selectedTemplate={selectedTemplate}
                    />
                  )}

                  {selectedTemplate && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg">
                          {selectedTemplate.subject === "math"
                            ? "📐"
                            : selectedTemplate.subject === "language_arts"
                              ? "📖"
                              : "🔬"}
                        </span>
                        <span className="text-sm font-medium">{selectedTemplate.name}</span>
                      </div>
                      <p className="mb-2 text-xs text-gray-600">{selectedTemplate.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{selectedTemplate.gradeLevel}</span>
                        <span>•</span>
                        <span>{selectedTemplate.estimatedTime}</span>
                        <span>•</span>
                        <span>⭐ {selectedTemplate.rating}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6 lg:col-span-1">
            {/* Basic Settings */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">⚙️ Basic Settings</CardTitle>
                <CardDescription>Configure your worksheet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">📚 Subject</label>
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">📐 Math</SelectItem>
                      <SelectItem value="language_arts">📖 Language Arts</SelectItem>
                      <SelectItem value="science">🔬 Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">📝 Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter worksheet title"
                    className="border-2"
                  />
                </div>

                {subject === "math" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">➕ Operation</label>
                    <Select
                      value={operation}
                      onValueChange={(value) =>
                        setOperation(
                          value as "addition" | "subtraction" | "multiplication" | "division"
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="addition">➕ Addition</SelectItem>
                        <SelectItem value="subtraction">➖ Subtraction</SelectItem>
                        <SelectItem value="multiplication">✖️ Multiplication</SelectItem>
                        <SelectItem value="division">➗ Division</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subject === "language_arts" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">📖 Type</label>
                    <Select
                      value={languageArtsType}
                      onValueChange={(value) => setLanguageArtsType(value as LanguageArtsType)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spelling">🔤 Spelling Words</SelectItem>
                        <SelectItem value="vocabulary">📚 Vocabulary</SelectItem>
                        <SelectItem value="writing">✍️ Writing Prompts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subject === "science" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">🔬 Science Type</label>
                    <Select
                      value={scienceType}
                      onValueChange={(value) => setScienceType(value as ScienceType)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select science type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="biology">🧬 Biology</SelectItem>
                        <SelectItem value="chemistry">⚗️ Chemistry</SelectItem>
                        <SelectItem value="physics">⚡ Physics</SelectItem>
                        <SelectItem value="earth-science">🌍 Earth Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subject === "language_arts" && languageArtsType === "writing" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">✍️ Writing Style</label>
                    <Select
                      value={writingType}
                      onValueChange={(value) =>
                        setWritingType(
                          value as
                            | "narrative"
                            | "expository"
                            | "persuasive"
                            | "descriptive"
                            | "mixed"
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select writing style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrative">📖 Narrative (Tell a Story)</SelectItem>
                        <SelectItem value="expository">📝 Expository (Explain/Inform)</SelectItem>
                        <SelectItem value="persuasive">💬 Persuasive (Convince)</SelectItem>
                        <SelectItem value="descriptive">
                          🎨 Descriptive (Paint a Picture)
                        </SelectItem>
                        <SelectItem value="mixed">🎲 Mixed (Random)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subject === "math" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">🎯 Difficulty Level</label>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DIFFICULTY_RANGES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      {DIFFICULTY_RANGES[difficulty].desc}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">🎓 Grade Level</label>
                    <Select
                      value={gradeLevel}
                      onValueChange={(value) => setGradeLevel(value as GradeLevel)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select grade level" />
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
                    <p className="rounded bg-green-50 px-3 py-2 text-xs text-green-700">
                      {subject === "science"
                        ? gradeLevel === "K"
                          ? "Basic science concepts & observations"
                          : gradeLevel === "1-2"
                            ? "Simple experiments & nature study"
                            : gradeLevel === "3-4"
                              ? "Scientific method & basic processes"
                              : gradeLevel === "5-6"
                                ? "Advanced concepts & lab skills"
                                : gradeLevel === "7-8"
                                  ? "Complex theories & analysis"
                                  : "Advanced science & research methods"
                        : gradeLevel === "K"
                          ? "Simple CVC words & basic sight words"
                          : gradeLevel === "1-2"
                            ? "Consonant blends, digraphs & common sight words"
                            : gradeLevel === "3-4"
                              ? "Multi-syllable words & common patterns"
                              : gradeLevel === "5-6"
                                ? "Complex words & Greek/Latin roots"
                                : "Advanced vocabulary & challenging spellings"}
                    </p>
                  </div>
                )}

                {difficulty === "custom" && (
                  <div className="space-y-4 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 p-4">
                    <h4 className="text-sm font-semibold text-purple-900">🎨 Custom Range</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Minimum</label>
                        <Input
                          type="number"
                          value={customMin}
                          onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)}
                          min="0"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Maximum</label>
                        <Input
                          type="number"
                          value={customMax}
                          onChange={(e) => setCustomMax(parseInt(e.target.value) || 100)}
                          min={customMin}
                          className="border-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    {subject === "math"
                      ? "🔢 Number of Problems"
                      : subject === "science"
                        ? "🔬 Number of Questions"
                        : languageArtsType === "spelling"
                          ? "📝 Number of Words"
                          : languageArtsType === "vocabulary"
                            ? "📚 Number of Vocabulary Words"
                            : "✍️ Number of Prompts"}
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max={
                      subject === "language_arts" && languageArtsType === "vocabulary"
                        ? "10"
                        : "100"
                    }
                    value={problemCount}
                    onChange={(e) => setProblemCount(parseInt(e.target.value) || 20)}
                    className="border-2"
                  />
                  <p className="text-muted-foreground text-xs">
                    {subject === "math"
                      ? "Between 5 and 100 problems"
                      : subject === "science"
                        ? "Between 5 and 50 questions"
                        : languageArtsType === "vocabulary"
                          ? "Between 5 and 10 vocabulary words"
                          : languageArtsType === "writing"
                            ? "Between 1 and 5 writing prompts"
                            : "Between 5 and 100 words"}
                  </p>
                </div>

                {worksheetType === "traditional" ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full text-lg shadow-md"
                    size="lg"
                  >
                    {isGenerating
                      ? "Generating..."
                      : subject === "math"
                        ? "🎲 Generate Problems"
                        : subject === "science"
                          ? "🔬 Generate Science Questions"
                          : languageArtsType === "spelling"
                            ? "🔤 Generate Spelling Words"
                            : languageArtsType === "vocabulary"
                              ? "📚 Generate Vocabulary"
                              : "✍️ Generate Writing Prompts"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateInteractiveWorksheet}
                    disabled={isGenerating}
                    className="w-full text-lg shadow-md"
                    size="lg"
                  >
                    🎮 Create Interactive Worksheet
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Advanced Customization */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">🎨 Advanced Customization</CardTitle>
                <CardDescription>Fine-tune your worksheet appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">📐 Layout</label>
                  <Select
                    value={layout}
                    onValueChange={(value) => setLayout(value as "standard" | "wide" | "narrow")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (8.5" × 11")</SelectItem>
                      <SelectItem value="wide">Wide (11" × 8.5")</SelectItem>
                      <SelectItem value="narrow">Narrow (6" × 9")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">📏 Spacing</label>
                  <Select
                    value={spacing}
                    onValueChange={(value) => setSpacing(value as "tight" | "normal" | "loose")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight (More problems per page)</SelectItem>
                      <SelectItem value="normal">Normal (Balanced spacing)</SelectItem>
                      <SelectItem value="loose">Loose (More space for answers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">📝 Custom Instructions</label>
                  <Input
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Add special instructions for students..."
                    className="border-2"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">🔲 Show Borders</label>
                    <Button
                      variant={showBorders ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowBorders(!showBorders)}
                    >
                      {showBorders ? "Yes" : "No"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">🔑 Include Answer Key</label>
                    <Button
                      variant={includeAnswerKey ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
                    >
                      {includeAnswerKey ? "Yes" : "No"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Styling Options */}
            {problems.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">🎨 Styling Options</CardTitle>
                  <CardDescription>Make your worksheet beautiful</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Background Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BACKGROUND_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setBackground(template.id)}
                          className={`rounded-lg border-2 p-3 text-left transition-all hover:shadow-md ${
                            background === template.id
                              ? "border-primary bg-primary/10 ring-primary ring-2"
                              : "border-gray-200"
                          }`}
                        >
                          <div
                            className="mb-2 h-8 w-full rounded"
                            style={{ background: template.preview }}
                          />
                          <div className="text-xs font-medium">{template.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">🔤 Font Style</label>
                    <FontSelector selectedFont={selectedFont} onFontSelect={handleFontSelect} />
                    <p className="text-xs text-gray-500">
                      Choose a font that matches your teaching style. Upload custom fonts for
                      handwriting practice.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">🖼️ Custom Background Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer border-2"
                    />
                    <p className="text-muted-foreground text-xs">
                      Upload your own image (will be subtle/transparent)
                    </p>
                  </div>

                  {/* Quota Display */}
                  <div className="mb-4">
                    <QuotaDisplay userId="current-user" />
                  </div>

                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full text-lg shadow-md"
                    size="lg"
                    variant="default"
                  >
                    {isExporting ? "Creating..." : "📄 Print Worksheet"}
                  </Button>

                  {/* Usage Warning */}
                  <UsageLimitWarning
                    userId="current-user"
                    action="exportsPerMonth"
                    className="mt-4"
                  />

                  {/* Upgrade Prompt for Free Users */}
                  <div className="mt-4">
                    <UpgradePrompt userId="current-user" variant="inline" />
                  </div>

                  {/* Session Tracking */}
                  <div className="mt-4">
                    <SessionRecorder
                      studentId="current-user" // In a real app, this would come from auth
                      worksheetId={`worksheet-${Date.now()}`}
                      subject={subject}
                      gradeLevel={gradeLevel}
                      difficulty={difficulty}
                      onSessionComplete={handleSessionComplete}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">👀 Live Preview</CardTitle>
                <CardDescription>
                  {problems.length > 0
                    ? `${problems.length} problems ready to print!`
                    : spellingWords.length > 0
                      ? `${spellingWords.length} spelling words ready to print!`
                      : vocabularyWords.length > 0
                        ? `${vocabularyWords.length} vocabulary words ready to print!`
                        : writingPrompts.length > 0
                          ? `${writingPrompts.length} writing prompts ready to print!`
                          : "Configure settings and generate content"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {problems.length === 0 &&
                spellingWords.length === 0 &&
                vocabularyWords.length === 0 &&
                writingPrompts.length === 0 ? (
                  <div className="flex h-[600px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">📋</div>
                      <p className="text-foreground text-xl font-medium">
                        Ready to create magic? ✨
                      </p>
                      <p className="text-muted-foreground mt-2">
                        Configure your settings on the left and click "Generate"
                      </p>
                    </div>
                  </div>
                ) : subject === "math" && problems.length > 0 ? (
                  <div className="space-y-6">
                    {/* Worksheet Preview */}
                    <div
                      className="rounded-xl border-2 p-8 shadow-inner"
                      style={
                        background === "custom" && customImage
                          ? {
                              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('${customImage}')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : {
                              background:
                                selectedBg?.css.split("background:")[1]?.split(";")[0] || "white",
                            }
                      }
                    >
                      <div className="rounded-lg bg-white/90 p-6 shadow-sm">
                        <h2 className="text-primary mb-2 text-center text-3xl font-bold">
                          {title}
                        </h2>
                        <p className="text-muted-foreground mb-6 text-center text-lg font-medium">
                          {operation.charAt(0).toUpperCase() + operation.slice(1)} -{" "}
                          {DIFFICULTY_RANGES[difficulty].label}
                        </p>

                        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                          <div className="text-sm font-medium">
                            <strong>Name:</strong> ___________________
                          </div>
                          <div className="text-sm font-medium">
                            <strong>Date:</strong> ___________________
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {problems.slice(0, 12).map((problem, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
                            >
                              <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                                {index + 1}
                              </span>
                              <span className="flex-1 text-lg font-medium">
                                {problem.problem} =
                              </span>
                              <span className="border-primary min-w-[60px] border-b-2 px-2 font-medium">
                                &nbsp;
                              </span>
                            </div>
                          ))}
                        </div>

                        {problems.length > 12 && (
                          <p className="text-muted-foreground mt-6 text-center text-sm font-medium">
                            + {problems.length - 12} more problems will appear when you print
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Answer Key Preview */}
                    <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-lg">
                      <h3 className="mb-4 text-center text-xl font-bold text-yellow-900">
                        📝 Answer Key Preview
                      </h3>
                      <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
                        {problems.slice(0, 12).map((problem, index) => (
                          <div
                            key={index}
                            className="rounded-lg bg-white p-2 text-center font-bold text-yellow-900 shadow-sm"
                          >
                            {index + 1}. {problem.answer}
                          </div>
                        ))}
                      </div>
                      {problems.length > 12 && (
                        <p className="mt-4 text-center text-xs text-yellow-800">
                          + {problems.length - 12} more answers
                        </p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl bg-white p-4 text-center shadow-md">
                        <div className="text-3xl font-bold text-blue-600">{problems.length}</div>
                        <div className="text-muted-foreground text-xs font-medium">Problems</div>
                      </div>
                      <div className="rounded-xl bg-white p-4 text-center shadow-md">
                        <div className="text-3xl font-bold text-purple-600">
                          {difficulty === "custom"
                            ? `${customMin}-${customMax}`
                            : `${DIFFICULTY_RANGES[difficulty].min}-${DIFFICULTY_RANGES[difficulty].max}`}
                        </div>
                        <div className="text-muted-foreground text-xs font-medium">Range</div>
                      </div>
                      <div className="rounded-xl bg-white p-4 text-center shadow-md">
                        <div className="text-3xl font-bold text-pink-600">
                          {operation === "addition"
                            ? "+"
                            : operation === "subtraction"
                              ? "−"
                              : operation === "multiplication"
                                ? "×"
                                : "÷"}
                        </div>
                        <div className="text-muted-foreground text-xs font-medium">Operation</div>
                      </div>
                    </div>
                  </div>
                ) : subject === "language_arts" && spellingWords.length > 0 ? (
                  <div className="space-y-6">
                    {/* Spelling Words Preview */}
                    <div className="rounded-xl border-2 bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                      <h2 className="text-primary mb-6 text-center text-3xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mb-6 text-center text-lg">
                        Grade {gradeLevel} Spelling Words
                      </p>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {spellingWords.map((word, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg border-2 bg-white p-4 shadow-sm"
                          >
                            <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                              {index + 1}
                            </span>
                            <span className="text-lg font-medium">{word.word}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : subject === "language_arts" && vocabularyWords.length > 0 ? (
                  <div className="space-y-6">
                    {/* Vocabulary Preview */}
                    <div className="rounded-xl border-2 bg-gradient-to-br from-green-50 to-blue-50 p-8">
                      <h2 className="text-primary mb-6 text-center text-3xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mb-6 text-center text-lg">
                        Grade {gradeLevel} Vocabulary
                      </p>
                      <div className="space-y-4">
                        {vocabularyWords.map((item, index) => (
                          <div key={index} className="rounded-lg border-2 bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              <span className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                                {index + 1}
                              </span>
                              <div>
                                <h3 className="text-lg font-bold text-purple-900">{item.word}</h3>
                                <p className="text-muted-foreground mt-1">{item.definition}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : subject === "language_arts" && writingPrompts.length > 0 ? (
                  <div className="space-y-6">
                    {/* Writing Prompts Preview */}
                    <div className="rounded-xl border-2 bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
                      <h2 className="text-primary mb-6 text-center text-3xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mb-6 text-center text-lg">
                        Writing Prompts
                      </p>
                      <div className="space-y-6">
                        {writingPrompts.map((prompt, index) => (
                          <div key={index} className="rounded-lg border-2 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                              <span className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                                {index + 1}
                              </span>
                              <div>
                                <span className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                                  {prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)}
                                </span>
                                <p className="text-lg font-medium">{prompt.prompt}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : subject === "science" && scienceProblems.length > 0 ? (
                  <div className="space-y-6">
                    {/* Science Questions Preview */}
                    <div className="rounded-xl border-2 bg-gradient-to-br from-green-50 to-teal-50 p-8">
                      <h2 className="text-primary mb-6 text-center text-3xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mb-6 text-center text-lg">
                        Grade {gradeLevel}{" "}
                        {scienceType.charAt(0).toUpperCase() + scienceType.slice(1)} Questions
                      </p>
                      <div className="space-y-4">
                        {scienceProblems.map((problem, index) => (
                          <div key={index} className="rounded-lg border-2 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                              <span className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <span className="mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                  {problem.type.charAt(0).toUpperCase() + problem.type.slice(1)}
                                </span>
                                <p className="mb-2 text-lg font-medium">{problem.question}</p>
                                <div className="rounded bg-gray-50 p-3">
                                  <p className="text-sm text-gray-600">
                                    <strong>Answer:</strong> {problem.answer}
                                  </p>
                                  {problem.explanation && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      <strong>Explanation:</strong> {problem.explanation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Interactive Worksheet Viewer */}
      {showInteractiveViewer && interactiveWorksheet && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-lg font-semibold">Interactive Worksheet</h2>
              <Button variant="outline" onClick={() => setShowInteractiveViewer(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <InteractiveWorksheetViewer
                worksheet={interactiveWorksheet}
                onComplete={handleInteractiveWorksheetComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate printable HTML
function generatePrintHTML(
  subject: string,
  data: unknown,
  backgroundStyle: string,
  font: FontInfo,
  theme: { colors: Record<string, string> }
): string {
  if (subject === "math") {
    return generateMathPrintHTML(
      data as { title: string; subtitle?: string; problems: MathProblem[] },
      backgroundStyle,
      font,
      theme
    );
  } else if (subject === "science") {
    return generateSciencePrintHTML(
      data as { title: string; subtitle?: string; problems: ScienceProblem[] },
      backgroundStyle,
      font,
      theme
    );
  }
  return generateMathPrintHTML(
    data as { title: string; subtitle?: string; problems: MathProblem[] },
    backgroundStyle,
    font,
    theme
  );
}

function generateMathPrintHTML(
  data: {
    title: string;
    subtitle?: string;
    problems: MathProblem[];
  },
  backgroundStyle: string,
  font: FontInfo,
  theme: { colors: Record<string, string> }
): string {
  const { title, subtitle, problems } = data;

  const worksheetProblems = problems
    .map(
      (p: MathProblem, i: number) => `
    <div class="problem">
      <span class="number">${i + 1}</span>
      <span class="text">${p.problem} = </span>
      <span class="answer-space"></span>
    </div>
  `
    )
    .join("");

  const answerKey = problems
    .map((p: MathProblem, i: number) => `<div class="answer-item">${i + 1}. ${p.answer}</div>`)
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        @media print {
          .no-print { display: none; }
          .page-break { page-break-before: always; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        
        body { 
          font-family: ${font.family}; 
          padding: 40px; 
          line-height: 1.6;
          ${backgroundStyle}
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
          color: ${theme.colors.text};
          background-color: ${theme.colors.background};
        }
        
        .controls { 
          margin: 20px 0; 
          text-align: center; 
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        button { 
          padding: 14px 32px; 
          font-size: 16px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          margin: 0 8px;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        
        button:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .worksheet-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #667eea; 
          padding-bottom: 20px; 
        }
        
        h1 { 
          font-size: 32pt; 
          margin-bottom: 8px; 
          color: #667eea;
          font-weight: bold;
        }
        
        h2 { 
          font-size: 18pt; 
          color: #764ba2; 
          font-weight: normal; 
        }
        
        .meta { 
          display: flex; 
          justify-content: space-between; 
          margin: 25px 0; 
          padding: 20px; 
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border-radius: 10px;
          font-size: 14pt;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .meta > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .meta strong { 
          color: #667eea;
          white-space: nowrap;
        }
        
        .meta .line {
          border-bottom: 2px solid #667eea;
          width: 200px;
          display: inline-block;
        }
        
        .problems { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 20px; 
          margin-top: 30px; 
        }
        
        .problem { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 14px; 
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          border: 2px solid #e0e0e0;
        }
        
        .number { 
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          font-weight: bold;
          font-size: 14pt;
        }
        
        .text { 
          font-size: 20pt; 
          flex: 1;
          font-weight: 500;
        }
        
        .answer-space { 
          border-bottom: 2px solid #667eea; 
          min-width: 100px; 
          display: inline-block; 
          margin-left: 8px;
        }
        
        .answer-key { 
          background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
          padding: 30px; 
          border: 3px solid #ffa726; 
          border-radius: 16px; 
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .answer-key h3 { 
          text-align: center; 
          color: #e65100; 
          margin-bottom: 25px; 
          font-size: 24pt;
          font-weight: bold;
        }
        
        .answers { 
          display: grid; 
          grid-template-columns: repeat(5, 1fr); 
          gap: 12px; 
        }
        
        .answer-item { 
          padding: 12px; 
          background: white; 
          border-radius: 8px; 
          text-align: center;
          font-weight: bold;
          border: 2px solid #ffb74d;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .footer {
          margin-top: 40px;
          padding: 20px;
          text-align: center;
          color: #999;
          font-size: 10pt;
          border-top: 1px solid #e0e0e0;
        }
        
        .footer .brand {
          color: #667eea;
          font-weight: bold;
        }
        
        .footer .copyright {
          font-size: 9pt;
          margin-top: 5px;
          color: #bbb;
        }
        
        .encouragement {
          margin-top: 50px;
          padding: 30px;
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          border: 3px dashed #ffa726;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .encourage-text {
          font-size: 24pt;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        
        .tips {
          font-size: 14pt;
          color: #764ba2;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="controls no-print">
        <button onclick="window.print()">🖨️ Print Worksheet</button>
        <button onclick="window.close()">Close Window</button>
      </div>
      
      <div class="worksheet-container">
        <div class="header">
          <h1>${title}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ""}
        </div>
        
        <div class="meta">
          <div><strong>Name:</strong> <span class="line"></span></div>
          <div><strong>Date:</strong> <span class="line"></span></div>
        </div>
        
        <div class="problems">
          ${worksheetProblems}
        </div>
      </div>
      
      <div class="page-break"></div>
      
      <div class="answer-key">
        <h3>📝 Answer Key</h3>
        <div class="answers">
          ${answerKey}
        </div>
        
        ${
          problems.length < 30
            ? `
        <div class="encouragement">
          <p class="encourage-text">🌟 Great job! 🌟</p>
          <p class="tips">Keep practicing to improve your math skills!</p>
        </div>
        `
            : ""
        }
      </div>
      
      <div class="footer">
        <p>Created with <span class="brand">Wyatt Works™</span></p>
        <p class="copyright">© ${new Date().getFullYear()} Wyatt Works. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

function generateSciencePrintHTML(
  data: {
    title: string;
    subtitle?: string;
    problems: ScienceProblem[];
  },
  backgroundStyle: string,
  font: FontInfo,
  theme: { colors: Record<string, string> }
): string {
  const { title, subtitle, problems } = data;

  const worksheetProblems = problems
    .map(
      (p: ScienceProblem, i: number) => `
    <div class="problem">
      <span class="number">${i + 1}</span>
      <span class="text">${p.question}</span>
      <div class="answer-space"></div>
    </div>
  `
    )
    .join("");

  const answerKey = problems
    .map(
      (p: ScienceProblem, i: number) => `
      <div class="answer-item">
        <strong>${i + 1}.</strong> ${p.answer}
        ${p.explanation ? `<br><em>Explanation:</em> ${p.explanation}` : ""}
      </div>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box;
          print-color-adjust: exact !important;
        }
        
        body {
          font-family: ${font.family};
          line-height: 1.6;
          color: #333;
          background: white;
          print-color-adjust: exact !important;
        }
        
        .worksheet {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          ${backgroundStyle}
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 2.5em;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .header h2 {
          font-size: 1.2em;
          color: #64748b;
          font-weight: normal;
        }
        
        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          font-size: 1.1em;
        }
        
        .meta .line {
          display: inline-block;
          width: 200px;
          border-bottom: 2px solid #3b82f6;
          margin-left: 10px;
        }
        
        .problems {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .problem {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          min-height: 80px;
        }
        
        .problem .number {
          background: #3b82f6;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .problem .text {
          flex: 1;
          font-size: 1.1em;
          line-height: 1.4;
        }
        
        .answer-space {
          height: 30px;
          border-bottom: 2px solid #3b82f6;
          width: 100px;
          margin-top: 10px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .answer-key {
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          print-color-adjust: exact !important;
        }
        
        .answer-key h3 {
          color: #1e40af;
          font-size: 1.8em;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .answers {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .answer-item {
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 0.95em;
          line-height: 1.4;
        }
        
        .encouragement {
          margin-top: 30px;
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #dbeafe, #e0e7ff);
          border-radius: 12px;
          border: 2px solid #3b82f6;
          print-color-adjust: exact !important;
        }
        
        .encourage-text {
          font-size: 1.5em;
          color: #1e40af;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .tips {
          color: #475569;
          font-size: 1.1em;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.9em;
          color: #64748b;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .brand {
          color: #3b82f6;
          font-weight: bold;
        }
        
        .copyright {
          margin-top: 5px;
          font-size: 0.8em;
        }
        
        @media print {
          .worksheet {
            margin: 0;
            padding: 0.3in;
          }
          
          .problems {
            grid-template-columns: 1fr 1fr;
          }
          
          .answers {
            grid-template-columns: 1fr 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="worksheet">
        <div class="header">
          <h1>${title}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ""}
        </div>
        
        <div class="meta">
          <div><strong>Name:</strong> <span class="line"></span></div>
          <div><strong>Date:</strong> <span class="line"></span></div>
        </div>
        
        <div class="problems">
          ${worksheetProblems}
        </div>
      </div>
      
      <div class="page-break"></div>
      
      <div class="answer-key">
        <h3>🔬 Answer Key</h3>
        <div class="answers">
          ${answerKey}
        </div>
        
        ${
          problems.length < 20
            ? `
        <div class="encouragement">
          <p class="encourage-text">🌟 Great job! 🌟</p>
          <p class="tips">Keep exploring science to discover amazing things!</p>
        </div>
        `
            : ""
        }
      </div>
      
      <div class="footer">
        <p>Created with <span class="brand">Wyatt Works™</span></p>
        <p class="copyright">© ${new Date().getFullYear()} Wyatt Works. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

// Note: PDF generation via html2canvas has compatibility issues
// Using browser's native print-to-PDF instead for better reliability
