/**
 * POST /api/export
 *
 * Generates worksheet PDFs with quota management and caching.
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { WorksheetConfigSchema, hashConfig } from "@/lib/config";
// Temporarily disabled for Vercel serverless (SQLite not supported)
// import { checkQuota, findExistingExport } from "@/lib/quota";
// import { generateWorksheetPDF } from "@/lib/pdf-generator";
// import prisma from "@/lib/prisma";
import { generateAddition } from "@/lib/generators/math";

/**
 * Export request schema
 */
const ExportRequestSchema = z.object({
  config: WorksheetConfigSchema,
  worksheetId: z.string().optional(),
  title: z.string().default("Math Practice"),
  subtitle: z.string().optional(),
  instructions: z.string().optional(),
});

/**
 * POST /api/export
 *
 * Flow:
 * 1. Validate request with Zod
 * 2. Compute configHash
 * 3. Check for existing export (userId, configHash)
 * 4. If exists: return existing URLs (no charge)
 * 5. If not: checkQuota(user)
 *    - Pro/Premium: allow
 *    - Free: allow if <15/month, else paywall
 * 6. Generate PDFs with Puppeteer
 * 7. Save to /tmp (later: Supabase Storage)
 * 8. Create ExportLog entry
 * 9. Return URLs
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = ExportRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
          message: validation.error.message,
        },
        { status: 400 }
      );
    }

    const { config, title, subtitle, instructions } = validation.data;

    // 3. Compute configHash
    const configHash = hashConfig(config);

    // For now, skip database operations on Vercel (SQLite not supported in serverless)
    // TODO: Add PostgreSQL for production

    // 4. Skip database checks for now (will add later with PostgreSQL)
    // For MVP: Allow all exports without quota tracking
    const quota = {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      plan: "free" as const,
      currentMonth: new Date().toISOString().slice(0, 7),
      paywall: false,
    };

    // 6. Generate math problems based on config
    const seed = config.seed || Date.now();
    const problems = [];

    // Generate different problem types
    // For now, default to addition - this can be expanded based on config
    switch (config.subject) {
      case "math":
        problems.push(
          ...generateAddition({
            count: config.options?.problemCount || 20,
            minValue:
              config.options?.difficulty === "easy"
                ? 1
                : config.options?.difficulty === "hard"
                  ? 10
                  : 5,
            maxValue:
              config.options?.difficulty === "easy"
                ? 10
                : config.options?.difficulty === "hard"
                  ? 100
                  : 50,
            seed,
          })
        );
        break;
      default:
        problems.push(...generateAddition({ count: 20, seed }));
    }

    // 7. For now, return problem data directly
    // TODO: Implement PDF generation with a service like Puppeteer on a dedicated server
    // or use client-side PDF generation with jsPDF/PDFKit
    const worksheetData = {
      title,
      subtitle,
      instructions: instructions || "Solve each problem. Show your work.",
      studentName: config.options?.includeStudentName ?? true,
      date: config.options?.includeDate ?? true,
      problems,
    };

    // 8. Return worksheet data (skip database for now - will add PostgreSQL later)
    return NextResponse.json({
      success: true,
      cached: false,
      data: worksheetData,
      exportId: `temp-${configHash.slice(0, 8)}`,
      quota: {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
        plan: quota.plan,
        currentMonth: quota.currentMonth,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export
 *
 * Returns quota information for the authenticated user
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Skip database for now - return unlimited quota
    return NextResponse.json({
      quota: {
        used: 0,
        limit: "unlimited",
        remaining: "unlimited",
        plan: "free",
        currentMonth: new Date().toISOString().slice(0, 7),
      },
    });
  } catch (error) {
    console.error("Quota check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
