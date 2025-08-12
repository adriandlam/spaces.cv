import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { FontFamily, Theme } from "@/app/generated/prisma";
import z from "zod";

// Validation schema for preferences
const preferencesSchema = z.object({
  hidden: z.boolean().optional(),
  googleIndexing: z.boolean().optional(),
  fontFamily: z.nativeEnum(FontFamily).optional(),
  theme: z.nativeEnum(Theme).optional(),
});

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized preferences fetch attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const profilePreferences = await prisma.profilePreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Create default preferences if they don't exist
    if (!profilePreferences) {
      const newPreferences = await prisma.profilePreferences.create({
        data: {
          userId: session.user.id,
          hidden: false,
          googleIndexing: true,
          fontFamily: FontFamily.SANS,
          theme: Theme.DARK,
        },
      });

      return NextResponse.json({
        profilePreferences: newPreferences,
      });
    }

    return NextResponse.json({
      profilePreferences,
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
      "Preferences fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized preferences update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = preferencesSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Preferences validation failed"
      );

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Find existing preferences or create new ones
    const existingPreferences = await prisma.profilePreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    let profilePreferences;

    if (existingPreferences) {
      // Update existing preferences
      profilePreferences = await prisma.profilePreferences.update({
        where: {
          userId: session.user.id,
        },
        data: validation.data,
      });
    } else {
      // Create new preferences with defaults and overrides from request
      profilePreferences = await prisma.profilePreferences.create({
        data: {
          userId: session.user.id,
          hidden: validation.data.hidden ?? false,
          googleIndexing: validation.data.googleIndexing ?? true,
          fontFamily: validation.data.fontFamily ?? FontFamily.SANS,
          theme: validation.data.theme ?? Theme.DARK,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      profilePreferences,
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
      "Preferences update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized preferences update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const fullPreferencesSchema = z.object({
      hidden: z.boolean(),
      googleIndexing: z.boolean(),
      fontFamily: z.enum(FontFamily),
      theme: z.enum(Theme),
    });

    const validation = fullPreferencesSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Preferences validation failed"
      );

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const profilePreferences = await prisma.profilePreferences.upsert({
      where: {
        userId: session.user.id,
      },
      update: validation.data,
      create: {
        userId: session.user.id,
        ...validation.data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      profilePreferences,
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
      "Preferences update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
