import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface JwtDebugPayload extends jwt.JwtPayload {
  userId?: string;
  email?: string;
  name?: string;
  moniteEntityId?: string;
  exp?: number;
}

// This endpoint is used to validate and check the debug session cookie status
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ 
      exists: false,
      message: "Debug sessions are not available in production" 
    });
  }

  try {
    // Get the debug session cookie directly from request headers
    // This avoids the typing issues with cookies() API in Next.js
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({
        exists: false,
        message: "No cookies found in request"
      });
    }
    
    // Parse the cookie string to find our debug session
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies.debug_session;
    
    if (!sessionToken) {
      return NextResponse.json({
        exists: false,
        message: "No debug session cookie found"
      });
    }

    // Verify the token
    try {
      const secret = process.env.NEXTAUTH_SECRET ?? "debug-secret";
      
      // Verify and decode the JWT token
      const decoded = jwt.verify(sessionToken, secret) as JwtDebugPayload;
      
      // Extract values with type safety
      const userId = decoded.userId ?? '';
      const email = decoded.email ?? '';
      const name = decoded.name ?? '';
      const moniteEntityId = decoded.moniteEntityId;
      const expiration = decoded.exp ?? 0;
      
      return NextResponse.json({
        exists: true,
        valid: true,
        userId,
        email,
        name,
        moniteEntityId,
        expires: new Date(expiration * 1000).toISOString()
      });
    } catch (_error) {
      // We intentionally ignore the specific JWT error and just return a generic message
      // Don't use the error, just return invalid status
      return NextResponse.json({
        exists: true,
        valid: false,
        message: "Invalid or expired debug session token"
      });
    }
  } catch (error) {
    // Handle any other errors in cookie processing
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      exists: false,
      valid: false,
      error: errorMessage 
    });
  }
}

// Helper function to parse cookie string into an object
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  // Parse cookie string into individual cookies
  const cookiePairs = cookieString.split(';');
  
  for (const cookie of cookiePairs) {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      // Join with = in case the value itself contains = characters
      const value = parts.slice(1).join('=').trim();
      // Safely handle the cookie name to prevent undefined access
      if (name.length > 0) {
        cookies[name] = value;
      }
    }
  }
  
  return cookies;
}
