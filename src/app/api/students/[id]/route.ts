import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  gradeLevel: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  avatar: z.string().url().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/students/[id]
 * Get a specific student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const student = await prisma.student.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Get student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/students/[id]
 * Update a specific student
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = UpdateStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if student exists and belongs to user
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...validation.data,
        birthDate: validation.data.birthDate ? new Date(validation.data.birthDate) : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preferences: validation.data.preferences as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Delete a specific student (soft delete by setting isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if student exists and belongs to user
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.student.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
