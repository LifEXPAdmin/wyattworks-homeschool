/**
 * PDF Generation with Puppeteer
 *
 * Generates worksheet and answer key PDFs from HTML templates.
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { MathProblem, FractionProblem } from "./generators/math";

/**
 * PDF generation options
 */
export interface PDFOptions {
  format?: "letter" | "a4" | "legal";
  orientation?: "portrait" | "landscape";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Worksheet data for PDF generation
 */
export interface WorksheetData {
  title: string;
  subtitle?: string;
  instructions?: string;
  studentName?: boolean;
  date?: boolean;
  problems: Array<MathProblem | FractionProblem>;
}

/**
 * Generated PDF files
 */
export interface GeneratedPDFs {
  worksheetPath: string;
  answerKeyPath: string;
}

/**
 * Generates HTML for worksheet
 */
function generateWorksheetHTML(data: WorksheetData, showAnswers: boolean = false): string {
  const { title, subtitle, instructions, studentName, date, problems } = data;

  const problemsHTML = problems
    .map(
      (p, i) => `
      <div class="problem">
        <span class="problem-number">${i + 1}.</span>
        <span class="problem-text">${p.problem} =</span>
        ${showAnswers ? `<span class="answer">${formatAnswer(p)}</span>` : '<span class="answer-space">_______</span>'}
      </div>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          padding: 1in;
          font-size: 14pt;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        
        .header h1 {
          font-size: 24pt;
          margin-bottom: 5px;
          color: #2c3e50;
        }
        
        .header h2 {
          font-size: 16pt;
          color: #7f8c8d;
          font-weight: normal;
        }
        
        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        
        .meta-item {
          font-size: 12pt;
        }
        
        .meta-item strong {
          margin-right: 5px;
        }
        
        .instructions {
          margin-bottom: 25px;
          padding: 15px;
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          border-radius: 4px;
        }
        
        .instructions p {
          margin: 0;
          color: #1976d2;
        }
        
        .problems {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px 30px;
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
        
        ${
          showAnswers
            ? `
        .answer-key-header {
          background: #fff3cd;
          padding: 15px;
          text-align: center;
          margin-bottom: 20px;
          border: 2px solid #ffc107;
          border-radius: 5px;
        }
        
        .answer-key-header h2 {
          color: #ff6f00;
          font-size: 18pt;
        }
        `
            : ""
        }
        
        @media print {
          body {
            padding: 0.5in;
          }
          
          .problems {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      ${
        showAnswers
          ? `
      <div class="answer-key-header">
        <h2>📝 Answer Key</h2>
      </div>
      `
          : ""
      }
      
      <div class="header">
        <h1>${title}</h1>
        ${subtitle ? `<h2>${subtitle}</h2>` : ""}
      </div>
      
      ${
        studentName || date
          ? `
      <div class="meta">
        ${studentName ? '<div class="meta-item"><strong>Name:</strong> ___________________</div>' : ""}
        ${date ? '<div class="meta-item"><strong>Date:</strong> ___________________</div>' : ""}
      </div>
      `
          : ""
      }
      
      ${
        instructions && !showAnswers
          ? `
      <div class="instructions">
        <p>${instructions}</p>
      </div>
      `
          : ""
      }
      
      <div class="problems">
        ${problemsHTML}
      </div>
    </body>
    </html>
  `;
}

/**
 * Formats answer for display
 */
function formatAnswer(problem: MathProblem | FractionProblem): string {
  if ("decimal" in problem) {
    // Fraction problem
    const frac = problem as FractionProblem;
    if (frac.answer.denominator === 1) {
      return String(frac.answer.numerator);
    }
    return `${frac.answer.numerator}/${frac.answer.denominator}`;
  }
  return String(problem.answer);
}

/**
 * Generates a PDF from HTML using Puppeteer
 */
async function generatePDFFromHTML(
  html: string,
  outputPath: string,
  options: PDFOptions
): Promise<void> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: options.format || "letter",
      landscape: options.orientation === "landscape",
      margin: options.margin || {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      printBackground: true,
    });
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * Generates worksheet and answer key PDFs
 *
 * @param data - Worksheet data
 * @param outputDir - Output directory (defaults to /tmp)
 * @param options - PDF generation options
 * @returns Paths to generated PDF files
 *
 * @example
 * ```typescript
 * const pdfs = await generateWorksheetPDF({
 *   title: "Math Practice",
 *   subtitle: "Addition Problems",
 *   problems: mathProblems,
 *   studentName: true,
 *   date: true,
 * });
 *
 * // pdfs.worksheetPath => "/tmp/worksheet-abc123.pdf"
 * // pdfs.answerKeyPath => "/tmp/answer-key-abc123.pdf"
 * ```
 */
export async function generateWorksheetPDF(
  data: WorksheetData,
  outputDir: string = "/tmp",
  options: PDFOptions = {}
): Promise<GeneratedPDFs> {
  // Generate unique IDs for the files
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const id = `${timestamp}-${random}`;

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // Generate worksheet HTML
  const worksheetHTML = generateWorksheetHTML(data, false);
  const worksheetPath = join(outputDir, `worksheet-${id}.pdf`);

  // Generate answer key HTML
  const answerKeyHTML = generateWorksheetHTML(data, true);
  const answerKeyPath = join(outputDir, `answer-key-${id}.pdf`);

  // Generate both PDFs
  await Promise.all([
    generatePDFFromHTML(worksheetHTML, worksheetPath, options),
    generatePDFFromHTML(answerKeyHTML, answerKeyPath, options),
  ]);

  return {
    worksheetPath,
    answerKeyPath,
  };
}

/**
 * Generates a preview HTML (for testing/debugging)
 */
export function generatePreviewHTML(data: WorksheetData, showAnswers: boolean = false): string {
  return generateWorksheetHTML(data, showAnswers);
}
