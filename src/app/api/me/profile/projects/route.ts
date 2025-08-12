import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

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

    const { title, from, to, description, company, link, collaborators } =
      validation.data;

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        from: from.trim(),
        to: to?.trim() || null,
        description: description.trim(),
        company: company?.trim() || null,
        link: link?.trim() || null,
        collaborators: collaborators,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      project,
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
      "Project creation failed"
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
      logger.warn({ requestId }, "Unauthorized project update attempt");
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
        "Invalid project update data"
      );

      return NextResponse.json(
        { error: "Invalid data: id and hidden (boolean) are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
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
      message: "Project updated successfully",
      project,
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
      "Project update failed"
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
      logger.warn({ requestId }, "Unauthorized project delete attempt");
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
        "Invalid project delete data"
      );

      return NextResponse.json(
        { error: "Invalid data: id is required" },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
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
      "Project delete failed"
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

    return NextResponse.json({
      projects,
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
      "Projects fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
