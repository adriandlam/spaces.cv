import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { z } from "zod";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const imageSchema = z.object({
  image: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

export async function PUT(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      logger.warn({ requestId }, "Unauthorized profile image update attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // TODO: parse body files here
    const formData = await req.formData();

    const image = formData.get("image");

    // TODO: Validate
    const validation = imageSchema.safeParse({ image });

    if (!validation.success) {
      logger.warn(
        {
          requestId,
          userId: session.user.id,
          validationErrors: validation.error.issues,
        },
        "Profile image update data validation failed"
      );
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
      );
    }
    logger.debug(
      {
        requestId,
        userId: session.user.id,
      },
      "Profile image update data validated"
    );

    // Generate file extension from MIME type
    const file = image as File;
    const extension = file.type.split("/")[1];
    const fileName = `profile-images/${session.user.id}/avatar.${extension}`;

    // Upload image directly to R2
    const fileBuffer = await file.arrayBuffer();

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        ContentLength: file.size,
      })
    );

    // Construct the public URL for the uploaded image
    const publicUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/${fileName}`;

    // Update user profile image with the public URL
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: publicUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      imageUrl: publicUrl,
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
      "Profile image update failed"
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
      logger.warn({ requestId }, "Unauthorized profile image fetch attempt");
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
        image: true,
      },
    });

    if (!user) {
      logger.warn({ requestId, userId: session.user.id }, "User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      image: user.image,
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
      "Profile image fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
