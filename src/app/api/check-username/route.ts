import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be no more than 32 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters"),
});

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const validation = usernameSchema.safeParse({ username });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 }
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
