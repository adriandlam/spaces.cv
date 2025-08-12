import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";
import type { PublicProfile, ProfileModalData } from "@/types/profile";

// TODO: Add rate limiting for profile updates (maybe 5 updates / min / user)

export async function GET() {
  const requestId = crypto.randomUUID();

  let user: PublicProfile | ProfileModalData | null = null;

  try {
    logger.debug({ requestId, type: "self" }, "Fetching self profile");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized profile access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    user = (await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        onboarded: true,
        email: true,
        image: true,
        title: true,
        about: true,
        location: true,
        website: true,
        projects: {
          orderBy: { createdAt: "asc" },
        },
        education: {
          orderBy: { from: "asc" },
        },
        workExperiences: {
          orderBy: { from: "asc" },
        },
        profileOrder: true,
        contacts: {
          orderBy: { createdAt: "asc" },
        },
        customStatus: true,
        profilePreferences: true,
      },
    })) as ProfileModalData;

    return NextResponse.json({ user });
  } catch (error) {
    logger.error(
      {
        requestId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      "Profile fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized profile update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate using Zod schema
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Profile validation failed"
      );

      return NextResponse.json(
        {
          error: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, username } = validation.data;

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedUsername = username.toLowerCase().trim();

    logger.debug(
      {
        requestId,
        userId: session.user.id,
        name: sanitizedName,
        username: sanitizedUsername,
      },
      "Profile update data validated and sanitized"
    );

    // Check if username is available by checking for existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        username: sanitizedUsername,
      },
      select: {
        id: true,
      },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          requestedUsername: sanitizedUsername,
        },
        "Username already taken"
      );

      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Update user profile
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: sanitizedName,
        username: sanitizedUsername,
        onboarded: true,
        onboardedAt: new Date(),
      },
    });

    // Get updated user data
    const updatedSession = await auth.api.getSession({
      headers: await headers(),
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedSession?.user || null,
    });
  } catch (error) {
    logger.error(
      {
        requestId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      "Profile update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
