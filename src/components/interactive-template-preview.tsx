"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  BookOpen,
  Brain,
  Crown,
  Download,
  Eye,
  AlertCircle,
  Palette,
  Type,
  Layout,
} from "lucide-react";

interface TemplatePreviewProps {
  onClose: () => void;
}

const SAMPLE_TEMPLATES = [
  {
    id: "math-master",
    name: "Math Master Template",
    description: "Professional math worksheet with custom styling",
    icon: FileText,
    color: "blue",
    preview: {
      title: "Addition Practice - Grade 2",
      problems: [
        "5 + 3 = ___",
        "7 + 2 = ___",
        "4 + 6 = ___",
        "8 + 1 = ___",
        "9 + 4 = ___",
        "6 + 5 = ___",
        "3 + 8 = ___",
        "2 + 9 = ___",
      ],
      styling: {
        font: "Inter",
        colors: "Blue theme",
        layout: "Grid layout with borders",
        spacing: "Comfortable spacing",
      },
    },
  },
  {
    id: "language-arts-pro",
    name: "Language Arts Pro",
    description: "Advanced language arts template with custom fonts",
    icon: BookOpen,
    color: "green",
    preview: {
      title: "Spelling Words - Week 1",
      problems: ["cat", "dog", "hat", "sun", "run", "fun", "big", "pig"],
      styling: {
        font: "Merriweather",
        colors: "Green theme",
        layout: "Clean list format",
        spacing: "Generous line spacing",
      },
    },
  },
  {
    id: "science-explorer",
    name: "Science Explorer",
    description: "Interactive science template with diagrams",
    icon: Brain,
    color: "purple",
    preview: {
      title: "Plant Parts - Grade 1",
      problems: [
        "Roots help the plant: ___",
        "Leaves make: ___",
        "Flowers produce: ___",
        "Stem carries: ___",
      ],
      styling: {
        font: "Roboto",
        colors: "Purple theme",
        layout: "Question-answer format",
        spacing: "Educational spacing",
      },
    },
  },
  {
    id: "custom-branded",
    name: "Custom Branded",
    description: "Add your own logo and branding",
    icon: Crown,
    color: "yellow",
    preview: {
      title: "Custom Worksheet - Your Brand",
      problems: [
        "Custom problem 1: ___",
        "Custom problem 2: ___",
        "Custom problem 3: ___",
        "Custom problem 4: ___",
      ],
      styling: {
        font: "Custom font",
        colors: "Your brand colors",
        layout: "Branded layout",
        spacing: "Custom spacing",
      },
    },
  },
];

export function InteractiveTemplatePreview({ onClose }: TemplatePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(SAMPLE_TEMPLATES[0]);
  const [customTitle, setCustomTitle] = useState("My Custom Worksheet");
  const [customProblems, setCustomProblems] = useState([
    "Problem 1: ___",
    "Problem 2: ___",
    "Problem 3: ___",
    "Problem 4: ___",
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const generatePreview = () => {
    setShowPreview(true);
  };

  const resetPreview = () => {
    setShowPreview(false);
    setCustomTitle("My Custom Worksheet");
    setCustomProblems(["Problem 1: ___", "Problem 2: ___", "Problem 3: ___", "Problem 4: ___"]);
  };

  if (showPreview) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-4xl rounded-lg bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-semibold">Live Template Preview</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetPreview}>
                Back to Templates
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4 rounded-lg bg-purple-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold">Live Preview</h4>
              </div>
              <p className="text-sm text-purple-800">
                This is a live preview of how your worksheet will look with the{" "}
                {selectedTemplate.name}. You can customize the content and see real-time changes!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Customization Panel */}
              <div className="space-y-4">
                <h4 className="font-semibold">Customize Your Worksheet</h4>

                <div>
                  <label className="text-sm font-medium">Worksheet Title</label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-1"
                    placeholder="Enter worksheet title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Problems/Questions</label>
                  <div className="mt-1 space-y-2">
                    {customProblems.map((problem, index) => (
                      <Input
                        key={index}
                        value={problem}
                        onChange={(e) => {
                          const newProblems = [...customProblems];
                          newProblems[index] = e.target.value;
                          setCustomProblems(newProblems);
                        }}
                        placeholder={`Problem ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Template Styling</label>
                  <div className="mt-2 space-y-2 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Type className="h-4 w-4 text-gray-500" />
                      <span>Font: {selectedTemplate.preview.styling.font}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Palette className="h-4 w-4 text-gray-500" />
                      <span>Colors: {selectedTemplate.preview.styling.colors}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Layout className="h-4 w-4 text-gray-500" />
                      <span>Layout: {selectedTemplate.preview.styling.layout}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">
                        Spacing: {selectedTemplate.preview.styling.spacing}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generatePreview} className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Update Preview
                  </Button>
                  <Button variant="outline" onClick={resetPreview}>
                    Reset
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <h4 className="font-semibold">Live Preview</h4>
                <div className="rounded-lg border bg-white p-6 shadow-lg">
                  <div
                    className={`mb-6 text-center ${
                      selectedTemplate.color === "blue"
                        ? "text-blue-800"
                        : selectedTemplate.color === "green"
                          ? "text-green-800"
                          : selectedTemplate.color === "purple"
                            ? "text-purple-800"
                            : "text-yellow-800"
                    }`}
                  >
                    <h2 className="mb-2 text-2xl font-bold">{customTitle}</h2>
                    <div className="text-sm opacity-75">Generated with {selectedTemplate.name}</div>
                  </div>

                  <div
                    className={`grid grid-cols-2 gap-4 ${
                      selectedTemplate.id === "language-arts-pro" ? "grid-cols-1" : ""
                    }`}
                  >
                    {customProblems.map((problem, index) => (
                      <div
                        key={index}
                        className={`rounded border-2 border-dashed p-3 ${
                          selectedTemplate.color === "blue"
                            ? "border-blue-200 bg-blue-50"
                            : selectedTemplate.color === "green"
                              ? "border-green-200 bg-green-50"
                              : selectedTemplate.color === "purple"
                                ? "border-purple-200 bg-purple-50"
                                : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <span className="font-medium">{index + 1}.</span>
                        <span className="ml-2">{problem}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4" />
                      <span>Premium Template - {selectedTemplate.name}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h5 className="font-semibold text-yellow-800">Preview Only</h5>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This is a preview of the premium template. To save and export your customized
                    worksheet, you'll need to upgrade to a premium plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Premium Template Preview</h3>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="p-6">
          <div className="mb-4 rounded-lg bg-purple-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <h4 className="font-semibold">Interactive Template Preview</h4>
            </div>
            <p className="text-sm text-purple-800">
              Explore our premium templates with live customization. You can modify content and see
              real-time changes. Your changes are NOT saved - this is just for testing!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SAMPLE_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate.id === template.id
                    ? `border-2 ${
                        template.color === "blue"
                          ? "border-blue-500"
                          : template.color === "green"
                            ? "border-green-500"
                            : template.color === "purple"
                              ? "border-purple-500"
                              : "border-yellow-500"
                      }`
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        template.color === "blue"
                          ? "bg-blue-100"
                          : template.color === "green"
                            ? "bg-green-100"
                            : template.color === "purple"
                              ? "bg-purple-100"
                              : "bg-yellow-100"
                      }`}
                    >
                      <template.icon
                        className={`h-6 w-6 ${
                          template.color === "blue"
                            ? "text-blue-600"
                            : template.color === "green"
                              ? "text-green-600"
                              : template.color === "purple"
                                ? "text-purple-600"
                                : "text-yellow-600"
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-gray-500" />
                      <span>Font: {template.preview.styling.font}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-500" />
                      <span>Theme: {template.preview.styling.colors}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4 text-gray-500" />
                      <span>Layout: {template.preview.styling.layout}</span>
                    </div>
                  </div>
                  <Badge className="mt-3 bg-purple-100 text-purple-800">Premium Template</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={generatePreview} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Eye className="mr-2 h-4 w-4" />
              Try {selectedTemplate.name} Live
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
