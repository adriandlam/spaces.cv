import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const { id } = await params;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn(
        {
          requestId,
          method: "PUT",
          path: `/api/me/profile/projects/${id}`,
        },
        "Unauthorized project update attempt"
      );

      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      logger.warn(
        {
          requestId,
          method: "PUT",
          path: `/api/me/profile/projects/${id}`,
        },
        "Project not found or access denied"
      );
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          method: "PUT",
          path: `/api/me/profile/projects/${id}`,
        },
        "Project update validation failed"
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

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title: title.trim(),
        year,
        description: description.trim(),
        company: company?.trim() || null,
        link: link?.trim() || null,
        collaborators: collaborators?.trim() || null,
      },
    });

    logger.info(
      {
        requestId,
        method: "PUT",
        path: `/api/me/profile/projects/${id}`,
        duration: Date.now() - startTime,
      },
      "Project updated successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    logger.error(
      {
        requestId,
        method: "PUT",
        path: `/api/me/profile/projects/${id}`,
        duration: Date.now() - startTime,
      },
      "Project update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  const { id } = await params;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn(
        {
          requestId,
          method: "DELETE",
          path: `/api/me/profile/projects/${id}`,
        },
        "Unauthorized project deletion attempt"
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      logger.warn(
        {
          requestId,
          method: "DELETE",
          path: `/api/me/profile/projects/${id}`,
        },
        "Project not found or access denied"
      );
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: {
        id,
      },
    });

    logger.info(
      {
        requestId,
        method: "DELETE",
        path: `/api/me/profile/projects/${id}`,
        duration: Date.now() - startTime,
      },
      "Project deleted successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    logger.error(
      {
        requestId,
        method: "DELETE",
        path: `/api/me/profile/projects/${id}`,
        duration: Date.now() - startTime,
      },
      "Project deletion failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
