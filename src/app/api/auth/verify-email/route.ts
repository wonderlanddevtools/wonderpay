import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import { z } from "zod";

// Validate request body
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Validate token
    const validationResult = verifyEmailSchema.safeParse({ token });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0]?.message ?? "Invalid token format" },
        { status: 400 }
      );
    }
    
    // Find verification token in the database
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        token,
      },
    });
    
    // If token doesn't exist or is expired
    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }
    
    if (new Date() > verificationToken.expires) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }
    
    // Update user email verification status
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });
    
    // Delete the used token
    await db.verificationToken.delete({
      where: { token },
    });
    
    // Redirect to verification success page
    return NextResponse.redirect(new URL('/email-verified', request.url));
  } catch (error) {
    console.error("Email verification error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
