import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { signIn } from "~/server/auth";
import { cookies } from "next/headers";

/**
 * Test login endpoint for debugging authentication issues
 * This bypasses NextAuth's normal flow for diagnostics
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    // Debug info
    console.log(`🔑 Test login attempt for email: ${email}`);
    
    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear any existing cookies for clean test
    cookies().getAll().forEach(cookie => {
      cookies().delete(cookie.name);
    });
    
    // Generate session and set cookies directly
    const result = await signIn("credentials", { 
      email, 
      password, 
      redirect: false 
    });
    
    // Log signin result
    console.log("🔒 Test login result:", result ? "Success" : "Failed");
    
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Authentication successful",
      redirectTo: "/dashboard"
    });
  } catch (error) {
    console.error("Test login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
