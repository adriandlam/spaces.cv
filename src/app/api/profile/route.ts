import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, username } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    if (!username?.trim()) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must start with a letter and contain only letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    // Check username length
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (username.length > 32) {
      return NextResponse.json(
        { error: "Username must be no more than 32 characters" },
        { status: 400 }
      );
    }

    // Check if username is available
    const { available } = await auth.api.isUsernameAvailable({
      body: {
        username: username.toLowerCase(),
      },
    });

    if (!available) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Update user profile
    const updateResult = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name.trim(),
        username: username.toLowerCase(),
        onboarded: true,
        onboardedAt: new Date(),
      },
    });

    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Get updated user data
    const updatedSession = await auth.api.getSession({
      headers: await headers(),
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedSession?.user || null,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
