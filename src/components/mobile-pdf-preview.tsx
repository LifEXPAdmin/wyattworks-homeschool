"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileDetector, responsiveUtils, type MobileConfig } from "@/lib/mobile-utils";
import {
  Download,
  Printer,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";

interface MobilePDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  worksheetData: {
    title: string;
    subtitle?: string;
    instructions?: string;
    studentName?: boolean;
    date?: boolean;
    problems: Array<{ problem: string; answer: string | number }>;
  };
  printOptions: {
    background: string;
    customImage?: string;
    selectedFont: string;
    spacing: string;
    showBorders: boolean;
    gradeLevel: string;
    difficulty?: string;
    scienceType?: string;
    languageArtsType?: string;
    customInstructions?: string;
  };
}

export function MobilePDFPreview({
  isOpen,
  onClose,
  worksheetData,
  printOptions,
}: MobilePDFPreviewProps) {
  const [mobileConfig, setMobileConfig] = useState<MobileConfig>(() => {
    try {
      return MobileDetector.getInstance().getConfig();
    } catch {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: "landscape",
        touchSupport: false,
        devicePixelRatio: 1,
      };
    }
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleConfigChange = (config: MobileConfig) => {
      setMobileConfig(config);
    };

    MobileDetector.getInstance().addListener(handleConfigChange);
    return () => MobileDetector.getInstance().removeListener(handleConfigChange);
  }, []);

  const generateWorksheetHTML = () => {
    const { title, studentName, date, problems } = worksheetData;
    const {
      background,
      customImage,
      selectedFont,
      spacing: spacingValue,
      showBorders,
      gradeLevel,
      difficulty,
      scienceType,
      languageArtsType,
      customInstructions,
    } = printOptions;

    // Background styling
    const backgroundStyles: Record<string, string> = {
      none: "background: white;",
      "subtle-grid":
        "background: white; background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px); background-size: 20px 20px;",
      notebook:
        "background: #fef9e7; background-image: repeating-linear-gradient(transparent, transparent 29px, #e8b4b4 29px, #e8b4b4 31px);",
      dots: "background-color: #fff; background-image: radial-gradient(circle, rgba(59, 130, 246, 0.08) 1px, transparent 1px); background-size: 20px 20px;",
      nature: "background: linear-gradient(135deg, #e8f5e9 0%, #fff8e1 50%, #fce4ec 100%);",
      sky: "background: linear-gradient(180deg, #e3f2fd 0%, #ffffff 40%);",
      warm: "background: linear-gradient(135deg, #fff9c4 0%, #ffecb3 50%, #ffe0b2 100%);",
      pastel:
        "background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #e1f5fe 50%, #e8f5e9 75%, #fff9c4 100%);",
      ocean: "background: linear-gradient(45deg, #e0f7fa 0%, #b3e5fc 50%, #81d4fa 100%);",
      forest: "background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);",
      lavender: "background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%);",
      sunset: "background: linear-gradient(135deg, #ffecb3 0%, #ffcc02 50%, #ff8f00 100%);",
      custom: customImage
        ? `background-image: url('${customImage}'); background-size: cover; background-position: center;`
        : "background: #f5f5f5;",
    };

    const selectedBackground = backgroundStyles[background] || "background: white;";

    const spacingStyle =
      spacingValue === "tight"
        ? "gap: 10px; padding: 5px;"
        : spacingValue === "loose"
          ? "gap: 30px; padding: 15px;"
          : "gap: 20px; padding: 10px;";

    const borderStyle = showBorders ? "border: 1px solid #ccc;" : "border: none;";

    const problemsHTML = problems
      .map(
        (problem, i) => `
      <div class="problem" style="${borderStyle} ${spacingStyle}">
        <span class="problem-number">${i + 1}.</span>
        <span class="problem-text">${problem.problem} =</span>
        ${showAnswers ? `<span class="answer">${formatAnswer(problem)}</span>` : '<span class="answer-space">_______</span>'}
      </div>
    `
      )
      .join("");

    return `
      <div class="worksheet" style="font-family: '${selectedFont}', sans-serif; transform: scale(${zoom}); transform-origin: top left; width: ${100 / zoom}%;">
        <div class="header">
          <h1>${title}</h1>
          <p>Grade ${gradeLevel} • ${difficulty || scienceType || languageArtsType}</p>
          ${customInstructions ? `<p><strong>Instructions:</strong> ${customInstructions}</p>` : ""}
          ${studentName ? `<div class="name-line"><strong>Name:</strong> ___________________</div>` : ""}
          ${date ? `<div class="date-line"><strong>Date:</strong> ___________________</div>` : ""}
        </div>
        
        <div class="problems">
          ${problemsHTML}
        </div>
      </div>
    `;
  };

  const formatAnswer = (problem: { problem: string; answer: string | number }): string => {
    if (problem.answer !== undefined) {
      return String(problem.answer);
    }
    return "Answer";
  };

  const handlePrint = () => {
    // Create a temporary print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${worksheetData.title}</title>
            <style>
              body { 
                font-family: "${printOptions.selectedFont}", sans-serif; 
                margin: 20px; 
                ${printOptions.background === "none" ? "background: white;" : ""}
                min-height: 100vh;
              }
              .worksheet { 
                max-width: 800px; 
                margin: 0 auto; 
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 10px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
              }
              .problems { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px;
              }
              .problem { 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                padding: 10px;
                border-bottom: 1px solid #e0e0e0;
              }
              .problem-number { 
                font-weight: bold; 
                min-width: 30px; 
                color: #2c3e50; 
              }
              .problem-text { 
                font-size: 16pt; 
                flex: 1; 
              }
              .answer-space { 
                min-width: 80px; 
                border-bottom: 2px solid #333; 
                display: inline-block; 
              }
              .answer { 
                font-weight: bold; 
                color: #27ae60; 
                min-width: 80px; 
              }
              .name-line, .date-line { 
                margin: 10px 0; 
                font-size: 14pt; 
              }
              @media print {
                body { margin: 0; }
                .worksheet { max-width: none; border-radius: 0; }
              }
            </style>
          </head>
          <body>
            ${generateWorksheetHTML()}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Trigger print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownload = () => {
    // For now, trigger print with "Save as PDF" option
    handlePrint();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: worksheetData.title,
          text: `Check out this ${worksheetData.title} worksheet!`,
          url: window.location.href,
        });
      } catch {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${worksheetData.title} - ${window.location.href}`);
      alert("Worksheet link copied to clipboard!");
    }
  };

  const resetZoom = () => setZoom(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${mobileConfig.isMobile ? "h-[90vh] w-[95vw] max-w-none" : "h-[80vh] w-[90vw] max-w-6xl"} p-0`}
      >
        <DialogHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {worksheetData.title}
              <Badge variant="outline" className="ml-2">
                {mobileConfig.isMobile ? "📱 Mobile" : "💻 Desktop"}
              </Badge>
            </DialogTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
                className="touch-friendly"
              >
                {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAnswers ? "Hide" : "Show"} Answers
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="touch-friendly"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" onClick={onClose} className="touch-friendly">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Mobile Controls */}
        {mobileConfig.isMobile && (
          <div className="flex items-center justify-between border-b bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetZoom} className="touch-friendly">
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="touch-friendly"
                >
                  -
                </Button>
                <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  className="touch-friendly"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="touch-friendly">
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="touch-friendly"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button onClick={handlePrint} className="touch-friendly">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        )}

        {/* PDF Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          <div
            className="worksheet-preview"
            style={{
              background: printOptions.background === "none" ? "white" : undefined,
              minHeight: "100%",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
            dangerouslySetInnerHTML={{ __html: generateWorksheetHTML() }}
          />
        </div>

        {/* Desktop Controls */}
        {!mobileConfig.isMobile && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {showAnswers ? "Hide" : "Show"} Answers
              </Button>

              <Button variant="outline" onClick={resetZoom}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Zoom
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                >
                  -
                </Button>
                <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        )}

        {/* Mobile-specific styles */}
        <style jsx>{`
          .touch-friendly {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            min-height: 44px;
            min-width: 44px;
          }

          .touch-friendly:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
          }

          .worksheet-preview {
            font-family: ${printOptions.selectedFont}, sans-serif;
          }

          .worksheet-preview .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }

          .worksheet-preview .header h1 {
            font-size: 24pt;
            margin-bottom: 5px;
            color: #2c3e50;
          }

          .worksheet-preview .problems {
            display: grid;
            grid-template-columns: ${mobileConfig.isMobile ? "1fr" : "repeat(2, 1fr)"};
            gap: 20px;
          }

          .worksheet-preview .problem {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
          }

          .worksheet-preview .problem-number {
            font-weight: bold;
            min-width: 30px;
            color: #2c3e50;
          }

          .worksheet-preview .problem-text {
            font-size: ${mobileConfig.isMobile ? "14pt" : "16pt"};
            flex: 1;
          }

          .worksheet-preview .answer-space {
            min-width: 80px;
            border-bottom: 2px solid #333;
            display: inline-block;
          }

          .worksheet-preview .answer {
            font-weight: bold;
            color: #27ae60;
            min-width: 80px;
          }

          .worksheet-preview .name-line,
          .worksheet-preview .date-line {
            margin: 10px 0;
            font-size: 14pt;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
