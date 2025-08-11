import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { educationSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized education creation attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = educationSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Education validation failed"
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
      from,
      to,
      degree,
      institution,
      location,
      url,
      description,
      fieldOfStudy,
      gpa,
      activities,
    } = validation.data;

    const education = await prisma.education.create({
      data: {
        from: from.trim(),
        to: to?.trim() || "",
        degree: degree.trim(),
        institution: institution.trim(),
        location: location?.trim() || null,
        url: url?.trim() || null,
        description: description?.trim() || null,
        fieldOfStudy: fieldOfStudy?.trim() || null,
        gpa: gpa?.trim() || null,
        activities: activities?.trim() || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Education created successfully",
      education,
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
      "Education creation failed"
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
      logger.warn({ requestId }, "Unauthorized education update attempt");
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
        "Invalid education update data"
      );

      return NextResponse.json(
        { error: "Invalid data: id and hidden (boolean) are required" },
        { status: 400 }
      );
    }

    const education = await prisma.education.update({
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
      message: "Education updated successfully",
      education,
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
      "Education update failed"
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
      logger.warn({ requestId }, "Unauthorized education delete attempt");
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
        "Invalid education delete data"
      );

      return NextResponse.json(
        { error: "Invalid data: id is required" },
        { status: 400 }
      );
    }

    await prisma.education.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Education deleted successfully",
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
      "Education delete failed"
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
      logger.warn({ requestId }, "Unauthorized education fetch attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const education = await prisma.education.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      education,
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
      "Education fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
