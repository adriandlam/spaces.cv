import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: { contains: query, mode: "insensitive" },
          },
          {
            username: { contains: query, mode: "insensitive" },
          },
          {
            about: { contains: query, mode: "insensitive" },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        customStatus: true,
      },
    });

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
      "Search fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
