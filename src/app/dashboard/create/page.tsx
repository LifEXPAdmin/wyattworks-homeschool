"use client";

import { useState } from "react";
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
import type { WorksheetConfig } from "@/lib/config";

type DifficultyLevel = "very_easy" | "easy" | "medium" | "hard" | "very_hard" | "custom";

const DIFFICULTY_RANGES = {
  very_easy: { min: 0, max: 5, label: "Very Easy (0-5)" },
  easy: { min: 1, max: 10, label: "Easy (1-10)" },
  medium: { min: 1, max: 20, label: "Medium (1-20)" },
  hard: { min: 10, max: 100, label: "Hard (10-100)" },
  very_hard: { min: 50, max: 500, label: "Very Hard (50-500)" },
  custom: { min: 0, max: 0, label: "Custom Range" },
};

export default function CreateWorksheet() {
  const [title, setTitle] = useState("Math Practice Worksheet");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [customMin, setCustomMin] = useState(1);
  const [customMax, setCustomMax] = useState(20);
  const [problemCount, setProblemCount] = useState(20);
  const [operation, setOperation] = useState<
    "addition" | "subtraction" | "multiplication" | "division"
  >("addition");
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    const seed = Date.now();

    const range =
      difficulty === "custom" ? { min: customMin, max: customMax } : DIFFICULTY_RANGES[difficulty];

    let generated: MathProblem[] = [];

    try {
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
          generated = generateMultiplication({
            count: problemCount,
            minValue: Math.max(range.min, 1),
            maxValue: Math.min(range.max, 20),
            seed,
          });
          break;
        case "division":
          generated = generateDivision({
            count: problemCount,
            minValue: Math.max(range.min, 2),
            maxValue: Math.min(range.max, 20),
            seed,
            requireWholeNumbers: true,
          });
          break;
      }

      setProblems(generated);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate problems. Please try different settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (problems.length === 0) {
      alert("Please generate problems first!");
      return;
    }

    setIsExporting(true);

    // Map our difficulty to config difficulty
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

      // Client-side: Create a printable version
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(generatePrintHTML(result.data));
        printWindow.document.close();
        alert(
          result.cached
            ? "Using cached worksheet (no quota used)! Check the new window/tab."
            : `Worksheet created! Check the new window/tab to print. (Unlimited exports available)`
        );
      } else {
        alert(
          "Popup blocked! Please allow popups for this site, then try again.\n\n" +
            "Or click OK and I'll show the worksheet on this page instead."
        );
        // Fallback: Replace current page
        document.body.innerHTML = generatePrintHTML(result.data);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export worksheet. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Navbar */}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-primary text-2xl font-bold">
                Wyatt Works
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">← Back to Dashboard</Button>
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
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Create Worksheet</h1>
          <p className="text-muted-foreground">
            Customize your worksheet settings and generate practice problems
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Worksheet Settings</CardTitle>
                <CardDescription>Configure your worksheet options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter worksheet title"
                  />
                </div>

                {/* Operation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operation</label>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    value={operation}
                    onChange={(e) =>
                      setOperation(
                        e.target.value as "addition" | "subtraction" | "multiplication" | "division"
                      )
                    }
                  >
                    <option value="addition">Addition (+)</option>
                    <option value="subtraction">Subtraction (−)</option>
                    <option value="multiplication">Multiplication (×)</option>
                    <option value="division">Division (÷)</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  >
                    <option value="very_easy">{DIFFICULTY_RANGES.very_easy.label}</option>
                    <option value="easy">{DIFFICULTY_RANGES.easy.label}</option>
                    <option value="medium">{DIFFICULTY_RANGES.medium.label}</option>
                    <option value="hard">{DIFFICULTY_RANGES.hard.label}</option>
                    <option value="very_hard">{DIFFICULTY_RANGES.very_hard.label}</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <p className="text-muted-foreground text-xs">
                    {difficulty === "custom"
                      ? "Set your own min and max values below"
                      : `Numbers will range from ${DIFFICULTY_RANGES[difficulty].min} to ${DIFFICULTY_RANGES[difficulty].max}`}
                  </p>
                </div>

                {/* Custom Range Inputs */}
                {difficulty === "custom" && (
                  <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold">Custom Range</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Min Value</label>
                        <Input
                          type="number"
                          value={customMin}
                          onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Max Value</label>
                        <Input
                          type="number"
                          value={customMax}
                          onChange={(e) => setCustomMax(parseInt(e.target.value) || 100)}
                          min={customMin}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Problem Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Problems</label>
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={problemCount}
                    onChange={(e) => setProblemCount(parseInt(e.target.value) || 20)}
                  />
                  <p className="text-muted-foreground text-xs">Between 5 and 100 problems</p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? "Generating..." : "🎲 Generate Problems"}
                </Button>

                {/* Export Button */}
                {problems.length > 0 && (
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full"
                    variant="default"
                    size="lg"
                  >
                    {isExporting ? "Exporting..." : "📄 Export Worksheet"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {problems.length > 0
                    ? `${problems.length} problems generated`
                    : "Generate problems to see preview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {problems.length === 0 ? (
                  <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center">
                      <p className="text-muted-foreground text-lg">
                        👈 Configure your settings and click "Generate Problems"
                      </p>
                      <p className="text-muted-foreground mt-2 text-sm">
                        You'll see a preview of your worksheet here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Worksheet Preview */}
                    <div className="bg-card rounded-lg border p-8">
                      <h2 className="mb-2 text-center text-3xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mb-6 text-center text-lg">
                        {operation.charAt(0).toUpperCase() + operation.slice(1)} -{" "}
                        {DIFFICULTY_RANGES[difficulty].label}
                      </p>

                      <div className="bg-muted mb-6 grid grid-cols-2 gap-4 rounded-lg p-4">
                        <div className="text-sm">
                          <strong>Name:</strong> ___________________
                        </div>
                        <div className="text-sm">
                          <strong>Date:</strong> ___________________
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {problems.slice(0, 12).map((problem, index) => (
                          <div key={index} className="flex items-center gap-3 rounded border p-3">
                            <span className="text-primary min-w-[30px] font-bold">
                              {index + 1}.
                            </span>
                            <span className="flex-1 text-lg font-medium">{problem.problem} =</span>
                            <span className="border-foreground min-w-[60px] border-b-2 px-2">
                              &nbsp;
                            </span>
                          </div>
                        ))}
                      </div>

                      {problems.length > 12 && (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                          + {problems.length - 12} more problems (shown when exported)
                        </p>
                      )}
                    </div>

                    {/* Answer Key Preview */}
                    <div className="rounded-lg border bg-yellow-50 p-6 dark:bg-yellow-950/30">
                      <h3 className="mb-4 text-center text-xl font-semibold text-yellow-900 dark:text-yellow-100">
                        📝 Answer Key Preview
                      </h3>
                      <div className="grid grid-cols-4 gap-3 text-sm md:grid-cols-6">
                        {problems.slice(0, 12).map((problem, index) => (
                          <div
                            key={index}
                            className="rounded bg-yellow-100 p-2 text-center font-medium text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100"
                          >
                            {index + 1}. {problem.answer}
                          </div>
                        ))}
                      </div>
                      {problems.length > 12 && (
                        <p className="mt-4 text-center text-xs text-yellow-700 dark:text-yellow-300">
                          + {problems.length - 12} more answers
                        </p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-muted/50 grid grid-cols-3 gap-4 rounded-lg border p-4">
                      <div className="text-center">
                        <div className="text-primary text-2xl font-bold">{problems.length}</div>
                        <div className="text-muted-foreground text-xs">Problems</div>
                      </div>
                      <div className="text-center">
                        <div className="text-primary text-2xl font-bold">
                          {difficulty === "custom"
                            ? `${customMin}-${customMax}`
                            : `${DIFFICULTY_RANGES[difficulty].min}-${DIFFICULTY_RANGES[difficulty].max}`}
                        </div>
                        <div className="text-muted-foreground text-xs">Number Range</div>
                      </div>
                      <div className="text-center">
                        <div className="text-primary text-2xl font-bold">
                          {operation === "addition"
                            ? "+"
                            : operation === "subtraction"
                              ? "−"
                              : operation === "multiplication"
                                ? "×"
                                : "÷"}
                        </div>
                        <div className="text-muted-foreground text-xs">Operation</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate printable HTML
function generatePrintHTML(data: {
  title: string;
  subtitle?: string;
  problems: MathProblem[];
}): string {
  const { title, subtitle, problems } = data;

  const worksheetProblems = problems
    .map(
      (p: MathProblem, i: number) => `
    <div class="problem">
      <span class="number">${i + 1}.</span>
      <span class="text">${p.problem} =</span>
      <span class="answer-space">_______</span>
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
        @media print {
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        h1 { font-size: 28pt; margin-bottom: 8px; }
        h2 { font-size: 16pt; color: #666; font-weight: normal; }
        .meta { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .problems { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 30px; }
        .problem { display: flex; align-items: center; gap: 10px; padding: 12px; border-bottom: 1px solid #e0e0e0; }
        .number { font-weight: bold; min-width: 30px; }
        .text { font-size: 18pt; flex: 1; }
        .answer-space { border-bottom: 2px solid #333; min-width: 80px; display: inline-block; }
        .answer-key { margin-top: 40px; padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; }
        .answer-key h3 { text-align: center; color: #856404; margin-bottom: 20px; }
        .answers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .answer-item { padding: 8px; background: #fff; border-radius: 4px; text-align: center; }
        .controls { margin: 20px 0; text-align: center; }
        button { padding: 12px 24px; font-size: 16px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 0 8px; }
        button:hover { background: #555; }
      </style>
    </head>
    <body>
      <div class="controls no-print">
        <button onclick="window.print()">🖨️ Print Worksheet</button>
        <button onclick="window.close()">Close</button>
      </div>
      
      <div class="header">
        <h1>${title}</h1>
        <h2>${subtitle || ""}</h2>
      </div>
      
      <div class="meta">
        <div><strong>Name:</strong> ___________________</div>
        <div><strong>Date:</strong> ___________________</div>
      </div>
      
      <div class="problems">
        ${worksheetProblems}
      </div>
      
      <div class="page-break"></div>
      
      <div class="answer-key">
        <h3>📝 Answer Key</h3>
        <div class="answers">
          ${answerKey}
        </div>
      </div>
    </body>
    </html>
  `;
}
