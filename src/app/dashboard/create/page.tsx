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
import { exportWorksheet, type ExportResponse, type ExportError } from "@/lib/api-client";
import type { WorksheetConfig } from "@/lib/config";

export default function CreateWorksheet() {
  const [title, setTitle] = useState("Math Practice Worksheet");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [problemCount, setProblemCount] = useState(20);
  const [operation, setOperation] = useState<
    "addition" | "subtraction" | "multiplication" | "division"
  >("addition");
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResponse | ExportError | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    const seed = Date.now();

    const minMax = {
      easy: { min: 1, max: 10 },
      medium: { min: 1, max: 50 },
      hard: { min: 10, max: 100 },
    };

    const { min, max } = minMax[difficulty];

    let generated: MathProblem[] = [];

    switch (operation) {
      case "addition":
        generated = generateAddition({ count: problemCount, minValue: min, maxValue: max, seed });
        break;
      case "subtraction":
        generated = generateSubtraction({
          count: problemCount,
          minValue: min,
          maxValue: max,
          seed,
          allowNegativeResults: false,
        });
        break;
      case "multiplication":
        generated = generateMultiplication({
          count: problemCount,
          minValue: 2,
          maxValue: 12,
          seed,
        });
        break;
      case "division":
        generated = generateDivision({
          count: problemCount,
          minValue: 2,
          maxValue: 12,
          seed,
          requireWholeNumbers: true,
        });
        break;
    }

    setProblems(generated);
    setIsGenerating(false);
  };

  const handleExport = async () => {
    if (problems.length === 0) {
      alert("Please generate problems first!");
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    const config: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {
        problemCount,
        difficulty,
        showAnswerKey: false,
      },
      layout: {
        orientation: "portrait",
        pageSize: "letter",
      },
      seed: Date.now(),
    };

    try {
      const result = await exportWorksheet({
        config,
        title,
        subtitle: `${operation.charAt(0).toUpperCase() + operation.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
        instructions: "Solve each problem. Show your work.",
      });

      setExportResult(result);

      if ("success" in result && result.success) {
        alert(
          result.cached
            ? "Using cached worksheet (no quota used)!"
            : `Worksheet created! ${result.quota?.remaining} exports remaining this month.`
        );
      } else if ("paywall" in result && result.paywall) {
        alert(
          `Quota exceeded! You've used ${result.quota?.used}/${result.quota?.limit} exports this month. Please upgrade to continue.`
        );
      } else if ("error" in result) {
        alert(`Error: ${result.error}`);
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
                    <option value="addition">Addition</option>
                    <option value="subtraction">Subtraction</option>
                    <option value="multiplication">Multiplication</option>
                    <option value="division">Division</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                  >
                    <option value="easy">Easy (1-10)</option>
                    <option value="medium">Medium (1-50)</option>
                    <option value="hard">Hard (10-100)</option>
                  </select>
                </div>

                {/* Problem Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Problems</label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={problemCount}
                    onChange={(e) => setProblemCount(parseInt(e.target.value) || 20)}
                  />
                </div>

                {/* Generate Button */}
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                  {isGenerating ? "Generating..." : "Generate Problems"}
                </Button>

                {/* Export Button */}
                {problems.length > 0 && (
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full"
                    variant="default"
                  >
                    {isExporting ? "Exporting..." : "📄 Export to PDF"}
                  </Button>
                )}

                {/* Export Result */}
                {exportResult && "success" in exportResult && exportResult.success && (
                  <div className="space-y-2 rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      ✅ Export Successful!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {exportResult.cached
                        ? "Using cached worksheet (no quota used)"
                        : `${exportResult.quota?.remaining} exports remaining`}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={exportResult.urls?.worksheet || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Worksheet
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={exportResult.urls?.answerKey || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Answer Key
                        </a>
                      </Button>
                    </div>
                  </div>
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
                      <p className="text-muted-foreground">
                        Configure your worksheet settings and click "Generate Problems" to see a
                        preview
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-6">
                      <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mb-6 text-center">
                        {operation.charAt(0).toUpperCase() + operation.slice(1)} -{" "}
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                      </p>

                      <div className="bg-muted mb-6 grid grid-cols-2 gap-4 rounded-lg p-4">
                        <div>
                          <strong>Name:</strong> ___________________
                        </div>
                        <div>
                          <strong>Date:</strong> ___________________
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {problems.slice(0, 10).map((problem, index) => (
                          <div key={index} className="flex items-center gap-3 rounded border p-3">
                            <span className="text-primary font-bold">{index + 1}.</span>
                            <span className="flex-1 text-lg">{problem.problem} =</span>
                            <span className="border-foreground border-b-2 px-4">
                              &nbsp;&nbsp;&nbsp;
                            </span>
                          </div>
                        ))}
                      </div>

                      {problems.length > 10 && (
                        <p className="text-muted-foreground mt-4 text-center text-sm">
                          + {problems.length - 10} more problems (shown in PDF)
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-950">
                      <h3 className="mb-3 font-semibold text-yellow-900 dark:text-yellow-100">
                        📝 Answer Key Preview
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                        {problems.slice(0, 8).map((problem, index) => (
                          <div key={index} className="text-yellow-800 dark:text-yellow-200">
                            {index + 1}. {problem.answer}
                          </div>
                        ))}
                      </div>
                      {problems.length > 8 && (
                        <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                          + {problems.length - 8} more answers
                        </p>
                      )}
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
