import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { z } from "zod";

const profileOrderSchema = z.object({
  profileOrder: z.array(z.string()).min(1).max(10),
});

export async function PUT(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized section order update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate using Zod schema
    const validation = profileOrderSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Section order validation failed"
      );

      return NextResponse.json(
        {
          error: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { profileOrder } = validation.data;

    logger.debug(
      {
        requestId,
        userId: session.user.id,
        profileOrder,
      },
      "Section order update data validated"
    );

    // Update user section order
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        profileOrder,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Section order updated successfully",
      profileOrder,
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
      "Section order update failed"
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
      logger.warn({ requestId }, "Unauthorized section order fetch attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        profileOrder: true,
      },
    });

    if (!user) {
      logger.warn({ requestId, userId: session.user.id }, "User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profileOrder: user.profileOrder || [
        "experience",
        "education",
        "projects",
      ],
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
      "Section order fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
