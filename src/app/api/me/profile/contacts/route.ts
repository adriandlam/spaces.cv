import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/profile";
import logger from "@/lib/logger";
import normalizeUrl from "normalize-url";
import type { ContactType } from "@/app/generated/prisma";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized contact creation attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Contact validation failed"
      );

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { type, value } = validation.data;

    const trimmedValue = value.trim();

    // For displaying
    const displayValue =
      type === "EMAIL" || type === "PHONE"
        ? trimmedValue
        : normalizeUrl(trimmedValue, {
            stripProtocol: true,
            removeQueryParameters: true,
            stripWWW: true,
            removeTrailingSlash: true,
          });

    // For href
    const hrefValue =
      type === "EMAIL"
        ? `mailto:${trimmedValue}`
        : type === "PHONE"
        ? `tel:${trimmedValue}`
        : normalizeUrl(trimmedValue, {
            defaultProtocol: "https",
            forceHttps: true,
            removeQueryParameters: true,
            removeTrailingSlash: true,
          });

    const contact = await prisma.contact.create({
      data: {
        type: type as ContactType,
        href: hrefValue,
        value: displayValue,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contact created successfully",
      contact,
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
      "Contact creation failed"
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
      logger.warn({ requestId }, "Unauthorized contact update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, hidden, value, type } = body;

    if (!id) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          body,
        },
        "Invalid contact update data"
      );

      return NextResponse.json(
        { error: "Invalid data: id is required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Handle hiding/showing contact
    if (typeof hidden === "boolean") {
      updateData.hidden = hidden;
    }

    // Handle content updates (value and/or type)
    if (value !== undefined || type !== undefined) {
      // Get current contact to determine type if not provided
      let contactType = type as ContactType;
      if (value !== undefined && type === undefined) {
        const currentContact = await prisma.contact.findFirst({
          where: { id, userId: session.user.id },
          select: { type: true }
        });
        contactType = currentContact?.type as ContactType;
      }

      if (value !== undefined) {
        const trimmedValue = value.trim();
        
        // For displaying
        const displayValue =
          contactType === "EMAIL" || contactType === "PHONE"
            ? trimmedValue
            : normalizeUrl(trimmedValue, {
                stripProtocol: true,
                removeQueryParameters: true,
                stripWWW: true,
                removeTrailingSlash: true,
              });

        // For href
        const hrefValue =
          contactType === "EMAIL"
            ? `mailto:${trimmedValue}`
            : contactType === "PHONE"
            ? `tel:${trimmedValue}`
            : normalizeUrl(trimmedValue, {
                defaultProtocol: "https",
                forceHttps: true,
                removeQueryParameters: true,
                removeTrailingSlash: true,
              });

        updateData.value = displayValue;
        updateData.href = hrefValue;
      }

      if (type !== undefined) {
        updateData.type = type as ContactType;
      }
    }

    // Ensure we have something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully",
      contact,
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
      "Contact update failed"
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
      logger.warn({ requestId }, "Unauthorized contact delete attempt");
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
        "Invalid contact delete data"
      );

      return NextResponse.json(
        { error: "Invalid data: id is required" },
        { status: 400 }
      );
    }

    await prisma.contact.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
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
      "Contact delete failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized contacts fetch attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      contacts,
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
      "Contacts fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
