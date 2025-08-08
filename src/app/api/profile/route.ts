import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

// TODO: Add rate limiting for profile updates (maybe 5 updates / min / user)

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(
    {
      requestId,
      method: "GET",
      path: "/api/profile",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Profile fetch request started"
  );

  try {
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");

    let user;

    if (username) {
      // Public profile lookup (no auth)
      logger.debug(
        { requestId, username, type: "public" },
        "Fetching public profile"
      );

      user = await prisma.user.findUnique({
        where: {
          username: username.toLowerCase(),
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          title: true,
          about: true,
          location: true,
          website: true,
          projects: {
            orderBy: { createdAt: "desc" },
          },
          educations: {
            orderBy: { from: "desc" },
          },
          workExperiences: {
            orderBy: { from: "desc" },
          },
          sectionOrder: true,
        },
      });
    } else {
      // Self profile (auth)
      logger.debug({ requestId, type: "self" }, "Fetching self profile");

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        logger.warn({ requestId }, "Unauthorized profile access attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          title: true,
          about: true,
          location: true,
          website: true,
          projects: {
            orderBy: { createdAt: "desc" },
          },
          educations: {
            orderBy: { from: "desc" },
          },
          workExperiences: {
            orderBy: { from: "desc" },
          },
          sectionOrder: true,
        },
      });
    }

    if (!user) {
      logger.warn({ requestId, username }, "Profile not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        userId: user.id,
        username: user.username,
        duration,
        type: username ? "public" : "self",
      },
      "Profile fetched successfully"
    );

    return NextResponse.json({ user });
  } catch (error) {
    const duration = Date.now() - startTime;
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
        duration,
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
  const startTime = Date.now();

  logger.info(
    {
      requestId,
      method: "POST",
      path: "/api/profile",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Profile update request started"
  );

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

    // Check if username is available
    const { available } = await auth.api.isUsernameAvailable({
      body: {
        username: sanitizedUsername,
      },
    });

    if (!available) {
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

    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        userId: session.user.id,
        newUsername: sanitizedUsername,
        duration,
      },
      "Profile updated successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedSession?.user || null,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
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
        duration,
      },
      "Profile update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
