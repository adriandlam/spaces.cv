import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { z } from "zod";

const sectionOrderSchema = z.object({
  sectionOrder: z.array(z.string()).min(1).max(10),
});

export async function PUT(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(
    {
      requestId,
      method: "PUT",
      path: "/api/profile/section-order",
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    },
    "Section order update request started"
  );

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
    const validation = sectionOrderSchema.safeParse(body);

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

    const { sectionOrder } = validation.data;

    logger.debug(
      {
        requestId,
        userId: session.user.id,
        sectionOrder,
      },
      "Section order update data validated"
    );

    // Update user section order
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        sectionOrder,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId,
        userId: session.user.id,
        sectionOrder,
        duration,
      },
      "Section order updated successfully"
    );

    return NextResponse.json({
      success: true,
      message: "Section order updated successfully",
      sectionOrder,
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
      "Section order update failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}