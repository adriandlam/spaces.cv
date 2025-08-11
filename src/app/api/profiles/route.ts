import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import type { PublicProfile } from "@/types/profile";

// TODO: Add rate limiting for profile updates (maybe 5 updates / min / user)

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    logger.debug({ requestId, type: "public" }, "Fetching public profiles");

    const searchParams = req.nextUrl.searchParams;
    const sort = searchParams.get("sort") as "recent" | "oldest" | null;

    const users: PublicProfile[] = (await prisma.user.findMany({
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
      orderBy: {
        createdAt: sort !== "oldest" ? "desc" : "asc",
      },
    })) as PublicProfile[];

    return NextResponse.json({ users });
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
      "Profiles fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
