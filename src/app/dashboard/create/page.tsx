"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile-layout";
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
import { InteractiveWorksheetViewer } from "@/components/interactive-worksheet-viewer";
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
import { InteractiveWorksheetManager, type InteractiveWorksheet } from "@/lib/interactive-elements";
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
    // Track analytics
    AnalyticsManager.trackEvent("user-123", "worksheet_completed", {
      score: results.score,
      type: "interactive",
      subject,
      gradeLevel,
      difficulty,
    });
    alert(`Worksheet completed! Score: ${results.score}%`);
  };

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
    setIsGenerating(true);
    const seed = Date.now();
    const startTime = performance.now();

    // Track worksheet creation event
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

    // Determine the current type based on subject
    const currentType =
      subject === "math"
        ? operation
        : subject === "language_arts"
          ? languageArtsType
          : subject === "science"
            ? scienceType
            : "unknown";

    // Check if offline (simplified)
    // if (offlineManager.canWorkOffline()) {
    // Add to pending actions for later sync (commented out)
    // offlineManager.addPendingAction({
    //   type: "export_worksheet",
    //   data: {
    //     subject,
    //     type: currentType,
    //     difficulty,
    //     problemCount,
    //     gradeLevel,
    //     problems,
    //     spellingWords,
    //     vocabularyWords,
    //     writingPrompts,
    //     scienceProblems,
    //   },
    // });

    // alert(
    //   "📡 You're offline! Your worksheet export has been queued and will sync when you're back online."
    // );
    // return;
    // }

    // Check usage limits (simplified)
    // if (!subscriptionManager.canPerformAction(userId, "exportsPerMonth")) {
    //   alert(
    //     "You've reached your monthly export limit. Please upgrade your plan to continue exporting worksheets."
    //   );
    //   return;
    // }

    // if (!subscriptionManager.canPerformAction(userId, "worksheetsPerMonth")) {
    //   alert(
    //     "You've reached your monthly worksheet limit. Please upgrade your plan to create more worksheets."
    //   );
    //   return;
    // }

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
        printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: ${selectedFont}; margin: 20px; }
              .worksheet { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .problems { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .problem { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="worksheet">
              <div class="header">
                <h1>${title}</h1>
                <p>Grade ${gradeLevel} • ${difficulty}</p>
              </div>
              <div class="problems">
                ${
                  subject === "math" && problems.length > 0
                    ? problems
                        .map(
                          (problem, index) =>
                            `<div class="problem">${index + 1}. ${problem.problem} = ____</div>`
                        )
                        .join("")
                    : ""
                }
                ${
                  subject === "language_arts" && spellingWords.length > 0
                    ? spellingWords
                        .map(
                          (word, index) => `<div class="problem">${index + 1}. ${word.word}</div>`
                        )
                        .join("")
                    : ""
                }
                ${
                  subject === "science" && scienceProblems.length > 0
                    ? scienceProblems
                        .map(
                          (problem, index) =>
                            `<div class="problem">${index + 1}. ${problem.question}</div>`
                        )
                        .join("")
                    : ""
                }
              </div>
            </div>
          </body>
        </html>
      `);
        printWindow.document.close();
        alert(
          "✅ Worksheet Ready!\n\nA new window has opened with your worksheet.\n\nClick the 'Print Worksheet' button and use your browser's print dialog to:\n• Save as PDF\n• Print directly"
        );

        // Track usage
        // subscriptionManager.incrementUsage(userId, "exportsPerMonth");
        // subscriptionManager.incrementUsage(userId, "worksheetsPerMonth");
      } else {
        alert(
          "Popup blocked! Please allow popups for this site, then try again.\n\nOr click OK and I'll show the worksheet on this page instead."
        );
        // document.body.innerHTML = generatePrintHTML(
        //   subject,
        //   result.data || contentData,
        //   bgStyle,
        //   selectedFont,
        //   currentTheme as unknown as { colors: Record<string, string> }
        // );
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
    <MobileLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-4xl font-bold">Create Your Worksheet</h1>
          <p className="text-muted-foreground text-lg">
            Customize, generate, and print beautiful math worksheets in seconds ✨
          </p>
        </div>

        {/* Word-like Interface */}
        <div className="flex h-screen flex-col">
          {/* Toolbar - Always visible at top */}
          <div className="border-b bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Document Type */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Button
                    variant={worksheetType === "traditional" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWorksheetType("traditional")}
                  >
                    📄 PDF
                  </Button>
                  <Button
                    variant={worksheetType === "interactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWorksheetType("interactive")}
                  >
                    🎮 Interactive
                  </Button>
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="homeschool-button"
                >
                  {isGenerating ? "Generating..." : "🎲 Generate"}
                </Button>
                <Button
                  onClick={() => setShowCustomizeModal(true)}
                  variant="outline"
                  className="homeschool-button-secondary"
                >
                  🎨 Customize PDF
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

          {/* Main Content Area - PDF Preview + Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* PDF Preview - Takes most of the space */}
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
                        Configure your settings in the toolbar above and click "Generate"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-white p-8 shadow-lg">
                    {/* Worksheet Content */}
                    {subject === "math" && problems.length > 0 ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="mb-2 text-2xl font-bold">{title}</h2>
                          <p className="text-gray-600">
                            Grade {gradeLevel} • {difficulty} • {problems.length} problems
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {problems.map((problem, index) => (
                            <div key={index} className="flex items-center gap-2 rounded border p-3">
                              <span className="font-medium">{index + 1}.</span>
                              <span>{problem.problem}</span>
                              <span className="ml-auto text-gray-500">= ____</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : subject === "language_arts" && spellingWords.length > 0 ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="mb-2 text-2xl font-bold">{title}</h2>
                          <p className="text-gray-600">Grade {gradeLevel} • Spelling Words</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {spellingWords.map((word, index) => (
                            <div key={index} className="rounded border p-3">
                              <span className="font-medium">{index + 1}.</span>
                              <span className="ml-2">{word.word}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : subject === "science" && scienceProblems.length > 0 ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="mb-2 text-2xl font-bold">{title}</h2>
                          <p className="text-gray-600">
                            Grade {gradeLevel} • {scienceType}
                          </p>
                        </div>
                        <div className="space-y-4">
                          {scienceProblems.map((problem, index) => (
                            <div key={index} className="rounded border p-4">
                              <div className="mb-2">
                                <span className="font-medium">{index + 1}.</span>
                                <span className="ml-2">{problem.question}</span>
                              </div>
                              <div className="h-8 border-b border-gray-300"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Compact settings */}
            <div className="w-80 overflow-auto border-l bg-white p-4">
              <div className="space-y-4">
                {/* Quick Settings */}
                <div>
                  <h3 className="mb-3 font-semibold">Quick Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {subject === "math" && (
                      <div>
                        <label className="text-sm font-medium">Operation</label>
                        <Select
                          value={operation}
                          onValueChange={(value) =>
                            setOperation(
                              value as "addition" | "subtraction" | "multiplication" | "division"
                            )
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Operation" />
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
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={languageArtsType}
                          onValueChange={(value) => setLanguageArtsType(value as LanguageArtsType)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spelling">🔤 Spelling Words</SelectItem>
                            <SelectItem value="vocabulary">📚 Vocabulary</SelectItem>
                            <SelectItem value="writing">✍️ Writing Prompts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <h3 className="mb-3 font-semibold">Templates</h3>
                  <div className="space-y-2">
                    <Button
                      variant={useTemplate ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setUseTemplate(true)}
                    >
                      📚 Use Template
                    </Button>
                    <Button
                      variant={!useTemplate ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setUseTemplate(false)}
                    >
                      ✏️ From Scratch
                    </Button>
                  </div>

                  {useTemplate && (
                    <div className="mt-3">
                      <TemplateSelector
                        onTemplateSelect={handleTemplateSelect}
                        selectedTemplate={selectedTemplate}
                      />
                    </div>
                  )}
                </div>

                {/* Collaboration Tools */}
                <div>
                  <h3 className="mb-3 font-semibold">Tools</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={handleStartCollaboration}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Start Collaboration
                    </Button>
                    <Button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </div>
                </div>

                {/* Usage Info */}
                <div className="border-t pt-4">
                  <QuotaDisplay userId="current-user" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customize PDF Modal */}
        {showCustomizeModal && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white">
              <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
                <h2 className="text-lg font-semibold">🎨 Customize PDF Appearance</h2>
                <Button variant="outline" onClick={() => setShowCustomizeModal(false)}>
                  Close
                </Button>
              </div>
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Layout</label>
                    <Select
                      value={layout}
                      onValueChange={(value) => setLayout(value as "standard" | "wide" | "narrow")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (8.5" × 11")</SelectItem>
                        <SelectItem value="wide">Wide (11" × 8.5")</SelectItem>
                        <SelectItem value="narrow">Narrow (6" × 9")</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Spacing</label>
                    <Select
                      value={spacing}
                      onValueChange={(value) => setSpacing(value as "tight" | "normal" | "loose")}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Spacing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Tight</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="loose">Loose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Custom Instructions</label>
                  <Input
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Add special instructions for students..."
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Borders</label>
                  <Button
                    variant={showBorders ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowBorders(!showBorders)}
                  >
                    {showBorders ? "Yes" : "No"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Include Answer Key</label>
                  <Button
                    variant={includeAnswerKey ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
                  >
                    {includeAnswerKey ? "Yes" : "No"}
                  </Button>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setShowCustomizeModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCustomizeModal(false);
                      // Regenerate with new settings
                      if (problems.length > 0 || spellingWords.length > 0) {
                        handleGenerate();
                      }
                    }}
                    className="homeschool-button"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </MobileLayout>
  );
}
