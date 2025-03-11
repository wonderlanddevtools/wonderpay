import { NextResponse } from "next/server";
import { db } from "~/server/db";
import crypto from "crypto";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { sendPasswordResetEmail } from "~/server/email";

// Validate request body
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});



export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email: string };
    
    // Validate request body
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    
    const { email } = validationResult.data;
    
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });
    
    // For security reasons, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true });
    }
    
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    
    // Store reset token in database
    try {
      await db.passwordReset.upsert({
        where: { userId: user.id },
        update: {
          token: resetToken,
          expires: resetTokenExpiry,
        },
        create: {
          userId: user.id,
          token: resetToken,
          expires: resetTokenExpiry,
        },
      });
    } catch (dbError) {
      console.error("Database error when upserting password reset token:", dbError);
      throw new Error("Failed to store password reset token");
    }
    
    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset request error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
