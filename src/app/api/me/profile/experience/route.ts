import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized experience creation attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = experienceSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Experience validation failed"
      );

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      title,
      company,
      from,
      to,
      location,
      description,
      skills,
    } = validation.data;

    // Parse skills from comma-separated string to array
    const skillsArray = skills
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const experience = await prisma.workExperience.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        from: from.trim(),
        to: to?.trim() || null,
        location: location?.trim() || null,
        description: description?.trim() || null,
        skills: skillsArray,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Experience created successfully",
      experience,
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
      "Experience creation failed"
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
      logger.warn({ requestId }, "Unauthorized experience update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, hidden } = body;

    if (!id || typeof hidden !== "boolean") {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          body,
        },
        "Invalid experience update data"
      );

      return NextResponse.json(
        { error: "Invalid data: id and hidden (boolean) are required" },
        { status: 400 }
      );
    }

    const experience = await prisma.workExperience.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        hidden,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Experience updated successfully",
      experience,
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
      "Experience update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized experience delete attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          body,
        },
        "Invalid experience delete data"
      );

      return NextResponse.json(
        { error: "Invalid data: id is required" },
        { status: 400 }
      );
    }

    await prisma.workExperience.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Experience deleted successfully",
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
      "Experience delete failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized experience fetch attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const experiences = await prisma.workExperience.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { to: 'asc' }, // Current jobs first (null values)
        { from: 'desc' }, // Then by start date, most recent first
      ],
    });

    return NextResponse.json({
      experiences,
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
      "Experience fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}