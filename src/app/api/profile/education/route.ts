import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { educationSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(
    {
      requestId,
      method: "POST",
      path: "/api/profile/education",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Education creation request started"
  );

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
      classmates,
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
        classmates: classmates?.trim() || null,
        fieldOfStudy: fieldOfStudy?.trim() || null,
        gpa: gpa?.trim() || null,
        activities: activities?.trim() || null,
        userId: session.user.id,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        userId: session.user.id,
        educationId: education.id,
        duration,
      },
      "Education created successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Education created successfully",
      education,
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
      "Education creation failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(
    {
      requestId,
      method: "GET",
      path: "/api/profile/education",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Education fetch request started"
  );

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

    const educations = await prisma.education.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        userId: session.user.id,
        educationCount: educations.length,
        duration,
      },
      "Education fetched successfully"
    );

    return NextResponse.json({
      educations,
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
      "Education fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}