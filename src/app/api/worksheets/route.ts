import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const CreateWorksheetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  content: z.record(z.string(), z.unknown()),
});

const UpdateWorksheetSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

/**
 * GET /api/worksheets
 * Get all worksheets for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const gradeLevel = searchParams.get("gradeLevel");
    const status = searchParams.get("status");

    const worksheets = await prisma.worksheet.findMany({
      where: {
        userId: user.id,
        ...(subject && { subject }),
        ...(gradeLevel && { gradeLevel }),
        ...(status && { status }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        exportLogs: {
          select: {
            id: true,
            format: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ worksheets });
  } catch (error) {
    console.error("Get worksheets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/worksheets
 * Create a new worksheet
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = CreateWorksheetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { title, description, subject, gradeLevel, content } = validation.data;

    const worksheet = await prisma.worksheet.create({
      data: {
        userId: user.id,
        title,
        description,
        subject,
        gradeLevel,
        content: JSON.stringify(content),
        status: "draft",
      },
    });

    return NextResponse.json({ worksheet }, { status: 201 });
  } catch (error) {
    console.error("Create worksheet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
