import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateWorksheetSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

/**
 * GET /api/worksheets/[id]
 * Get a specific worksheet by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worksheet = await prisma.worksheet.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        exportLogs: {
          select: {
            id: true,
            format: true,
            createdAt: true,
            metadata: true,
          },
        },
      },
    });

    if (!worksheet) {
      return NextResponse.json({ error: "Worksheet not found" }, { status: 404 });
    }

    // Parse content JSON
    const parsedWorksheet = {
      ...worksheet,
      content: JSON.parse(worksheet.content),
    };

    return NextResponse.json({ worksheet: parsedWorksheet });
  } catch (error) {
    console.error("Get worksheet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/worksheets/[id]
 * Update a specific worksheet
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UpdateWorksheetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { title, description, content, status } = validation.data;

    // Check if worksheet exists and belongs to user
    const existingWorksheet = await prisma.worksheet.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingWorksheet) {
      return NextResponse.json({ error: "Worksheet not found" }, { status: 404 });
    }

    const worksheet = await prisma.worksheet.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(content && { content: JSON.stringify(content) }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ worksheet });
  } catch (error) {
    console.error("Update worksheet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/worksheets/[id]
 * Delete a specific worksheet
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if worksheet exists and belongs to user
    const existingWorksheet = await prisma.worksheet.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingWorksheet) {
      return NextResponse.json({ error: "Worksheet not found" }, { status: 404 });
    }

    await prisma.worksheet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete worksheet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
