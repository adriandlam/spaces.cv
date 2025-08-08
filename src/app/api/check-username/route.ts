import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { available: false, error: "Username contains invalid characters" },
        { status: 200 }
      );
    }

    // Check length constraints
    if (username.length < 3) {
      return NextResponse.json(
        { available: false, error: "Username must be at least 3 characters" },
        { status: 200 }
      );
    }

    if (username.length > 32) {
      return NextResponse.json(
        {
          available: false,
          error: "Username must be no more than 32 characters",
        },
        { status: 200 }
      );
    }

    const { available } = await auth.api.isUsernameAvailable({
      body: {
        username: username.toLowerCase(),
      },
    });

    return NextResponse.json({
      available,
      username: username.toLowerCase(),
      message: available
        ? "Username is available"
        : "Username is already taken",
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
