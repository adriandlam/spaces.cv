import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(
    {
      requestId,
      method: "POST",
      path: "/api/profile/projects",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Project creation request started"
  );

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized project creation attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Project validation failed"
      );

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { title, year, description, company, link, collaborators } =
      validation.data;

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        year,
        description: description.trim(),
        company: company?.trim() || null,
        link: link?.trim() || null,
        collaborators: collaborators?.trim() || null,
        userId: session.user.id,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        userId: session.user.id,
        projectId: project.id,
        duration,
      },
      "Project created successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      project,
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
      "Project creation failed"
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
      path: "/api/profile/projects",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Projects fetch request started"
  );

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized projects fetch attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
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
        projectCount: projects.length,
        duration,
      },
      "Projects fetched successfully"
    );

    return NextResponse.json({
      projects,
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
      "Projects fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
