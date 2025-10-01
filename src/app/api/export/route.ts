/**
 * POST /api/export
 *
 * Generates worksheet PDFs with quota management and caching.
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { WorksheetConfigSchema, hashConfig } from "@/lib/config";
import { checkQuota, findExistingExport } from "@/lib/quota";
// import { generateWorksheetPDF } from "@/lib/pdf-generator"; // Disabled for serverless - Puppeteer not supported
import { generateAddition } from "@/lib/generators/math";
import prisma from "@/lib/prisma";

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

    const { config, worksheetId, title, subtitle, instructions } = validation.data;

    // 3. Compute configHash
    const configHash = hashConfig(config);

    // Ensure user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    // 4. Check for existing export
    const existingExport = await findExistingExport(dbUser.id, configHash);

    if (existingExport) {
      // Return existing data (no charge)
      const metadata = JSON.parse(existingExport.metadata || "{}");
      return NextResponse.json({
        success: true,
        cached: true,
        data: metadata.worksheetData,
        exportId: existingExport.id,
        createdAt: existingExport.createdAt,
      });
    }

    // 5. Check quota
    const quota = await checkQuota(dbUser.id);

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          paywall: quota.paywall,
          quota: {
            used: quota.limit - quota.remaining,
            limit: quota.limit,
            remaining: quota.remaining,
            plan: quota.plan,
            currentMonth: quota.currentMonth,
          },
        },
        { status: 403 }
      );
    }

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

    // 8. Create or get worksheet
    let finalWorksheetId = worksheetId;
    if (!finalWorksheetId) {
      // Create a temporary worksheet for the export
      const worksheet = await prisma.worksheet.create({
        data: {
          userId: dbUser.id,
          title: title,
          description: subtitle,
          content: JSON.stringify(problems),
          subject: config.subject,
          status: "draft",
          isPublic: false,
        },
      });
      finalWorksheetId = worksheet.id;
    }

    // 9. Create ExportLog entry
    const exportLog = await prisma.exportLog.create({
      data: {
        userId: dbUser.id,
        worksheetId: finalWorksheetId,
        format: "JSON", // Changed from PDF
        configHash,
        metadata: JSON.stringify({
          worksheetData,
          config,
          problemCount: problems.length,
        }),
      },
    });

    // 9. Return worksheet data (client will handle PDF generation)
    return NextResponse.json({
      success: true,
      cached: false,
      data: worksheetData,
      exportId: exportLog.id,
      quota: {
        used: quota.limit === Infinity ? Infinity : quota.limit - quota.remaining + 1,
        limit: quota.limit,
        remaining: quota.remaining === Infinity ? Infinity : quota.remaining - 1,
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

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { quota: { used: 0, limit: 15, remaining: 15, plan: "free" } },
        { status: 200 }
      );
    }

    const quota = await checkQuota(dbUser.id);

    return NextResponse.json({
      quota: {
        used: quota.limit === Infinity ? "unlimited" : quota.limit - quota.remaining,
        limit: quota.limit === Infinity ? "unlimited" : quota.limit,
        remaining: quota.remaining === Infinity ? "unlimited" : quota.remaining,
        plan: quota.plan,
        currentMonth: quota.currentMonth,
      },
    });
  } catch (error) {
    console.error("Quota check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
