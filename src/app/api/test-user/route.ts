import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

export async function POST(_req: NextRequest) {
  // In a real application, you would want to secure this endpoint
  // This is only for development purposes
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    // Check if the test user already exists
    const existingUser = await db.user.findUnique({
      where: { email: "test@wonderpay.com" },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Test user already exists", userId: existingUser.id },
        { status: 200 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("test123", 10);

    // Create the test user
    const newUser = await db.user.create({
      data: {
        email: "test@wonderpay.com",
        name: "Test User",
        password: hashedPassword,
        // Add other required fields as needed
      },
    });

    return NextResponse.json(
      { message: "Test user created successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json(
      { error: "Failed to create test user" },
      { status: 500 }
    );
  }
}
