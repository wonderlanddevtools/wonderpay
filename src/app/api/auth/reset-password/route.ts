import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validate request body
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { token, password } = validationResult.data;
    
    // Find the token in the database
    const passwordReset = await db.passwordReset.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    
    // If token doesn't exist or is expired
    if (!passwordReset) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user's password
    await db.user.update({
      where: { id: passwordReset?.userId ?? '' },
      data: { password: hashedPassword },
    });
    
    // Delete the used token
    if (passwordReset?.id) {
      await db.passwordReset.delete({
        where: { id: passwordReset.id },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
