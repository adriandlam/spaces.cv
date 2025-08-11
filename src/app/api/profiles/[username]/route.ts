import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import type { PublicProfile } from "@/types/profile";

// TODO: Add rate limiting for profile updates (maybe 5 updates / min / user)
// TODO: maybe don't need this rn?

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const requestId = crypto.randomUUID();
  const { username } = await params;

  let user: PublicProfile | null = null;

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    logger.debug(
      { requestId, username, type: "public" },
      "Fetching public profile"
    );

    user = (await prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        title: true,
        about: true,
        location: true,
        website: true,
        customStatus: true,
      },
    })) as PublicProfile;

    if (!user) {
      logger.warn({ requestId, username }, "Profile not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
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
      "Profile fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
