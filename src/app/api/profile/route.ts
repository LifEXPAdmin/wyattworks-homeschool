import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UserProfileSchema = z.object({
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/profile
 * Get current user's profile and students
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        profile: true,
        students: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
        include: {
          profile: true,
          students: true,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        imageUrl: dbUser.imageUrl,
        createdAt: dbUser.createdAt,
      },
      profile: dbUser.profile,
      students: dbUser.students,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UserProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: {
        ...validation.data,
        preferences: validation.data.preferences as Record<string, unknown>,
        settings: validation.data.settings as Record<string, unknown>,
        updatedAt: new Date(),
      },
      create: {
        userId: dbUser.id,
        ...validation.data,
        preferences: validation.data.preferences as Record<string, unknown>,
        settings: validation.data.settings as Record<string, unknown>,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
