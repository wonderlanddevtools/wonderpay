import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendVerificationEmail } from "~/server/email";

export async function GET() {
  try {
    // Find the most recent user
    const user = await db.user.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No users found in the database" },
        { status: 404 }
      );
    }

    console.log(`Found user: ${user.email}`);
    
    // Resend verification email
    if (user.email) {
      const result = await sendVerificationEmail(user.email);
      
      if (result) {
        console.log(`Verification email resent to ${user.email}`);
        return NextResponse.json({ 
          success: true, 
          message: `Verification email resent to ${user.email}`
        });
      } else {
        console.error(`Failed to resend verification email to ${user.email}`);
        return NextResponse.json(
          { error: "Failed to resend verification email" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "User has no email address" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
