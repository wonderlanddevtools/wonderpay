import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

// This direct login endpoint bypasses NextAuth to help debug authentication issues
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    // Use zod for validation
    const LoginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
    
    const result = LoginSchema.safeParse(await request.json());
    
    if (!result.success) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    const data = result.data;
    
    console.log(`📝 Debug login attempt for: ${data.email}`);
    
    // Find user in database
    const user = await db.user.findUnique({
      where: { email: data.email },
    });
    
    if (!user) {
      console.log(`❌ User not found: ${data.email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    if (!user.password) {
      console.log(`❌ No password set for user: ${data.email}`);
      return NextResponse.json({ error: "Invalid account setup" }, { status: 401 });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    
    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${data.email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    // Generate and set a simple session cookie without NextAuth
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name,
        moniteEntityId: user.moniteEntityId ?? undefined,
        // Add more debugging information
        debugSession: true,
        createdAt: new Date().toISOString()
      }, 
      process.env.NEXTAUTH_SECRET ?? "debug-secret",
      { expiresIn: "7d" } // Extend expiration for debugging
    );
    
    // Set cookie in the response
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      message: "Debug login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? 'No name provided',
        hasMoniteEntity: !!user.moniteEntityId
      },
      redirectTo: "/dashboard"
    });
    
    // Add cookie to response headers
    response.cookies.set({
      name: "debug_session",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days for easier debugging
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
    });
    
    // Add header to make it easier to detect auth success client-side
    response.headers.set('X-Auth-Debug-Status', 'success');
    
    console.log(`🍪 Debug cookie set for user: ${user.email}`);
    console.log(`✅ Debug login successful for: ${data.email}`);
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Debug login error:", errorMessage);
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}
