import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as jwt from "jsonwebtoken";

// Define which routes should be protected (require authentication)
const protectedRoutes = [
  "/dashboard",
  "/dashboard/bill-pay",
  "/dashboard/receivables",
  "/dashboard/create-invoice",
  "/dashboard/quickpay",
  "/dashboard/capital",
  "/dashboard/clients-vendors",
  "/dashboard/settings",
];

// Define routes that should be accessible only when NOT authenticated
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Define debug routes that should always be accessible and bypass auth checks
const publicRoutes = ["/auth-debug", "/", "/login", "/signup", "/forgot-password", "/reset-password"];

// For direct testing, we'll skip auth redirects for these routes in dev mode
const bypassRedirectsInDevMode = true;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for certain routes
  // 1. Next.js internal routes
  // 2. API routes
  // 3. Static files with extensions
  // 4. Explicitly defined debug routes
  // 5. Authentication routes (when in development mode, for easier testing)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    publicRoutes.some(route => pathname === route)
  ) {
    return NextResponse.next();
  }
  
  // Log the current request in development mode for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`👁️ Middleware processing: ${pathname}`);
  }

    // Check for NextAuth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Check for debug session cookie
  let hasDebugSession = false;
  const debugSessionCookie = request.cookies.get("debug_session");
  
  if (debugSessionCookie?.value) {
    try {
      // Verify the debug token with proper error handling
      // Using type assertion to ensure proper typing
      // Use type checking to ensure jwt is not an error
      if (jwt && typeof jwt.verify === 'function') {
        const debugToken = jwt.verify(
          debugSessionCookie.value, 
          process.env.NEXTAUTH_SECRET ?? "debug-secret"
        ) as jwt.JwtPayload;
        hasDebugSession = !!debugToken;
      }
      
      // hasDebugSession set in the verification code block above
      
      if (process.env.NODE_ENV === "development" && hasDebugSession) {
        console.log(`🪲 Debug session active for: ${request.nextUrl.pathname}`);
      }
    } catch (err) {
      // Invalid debug token
      console.error("Invalid debug session token", err instanceof Error ? err.message : 'Unknown error');
    }
  }
  
  // Consider authenticated if either token is valid
  const isAuthenticated = !!token || hasDebugSession;
  
  // In development mode, log auth status for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`📍 Auth check: ${request.nextUrl.pathname} → ${isAuthenticated ? "✅ AUTHENTICATED" : "❌ NOT AUTHENTICATED"}`);
  }
  
  // Only enforce auth protections in production or for specific protected routes
  // This makes development easier while still protecting key routes
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Debug logging for authentication state
  if (process.env.NODE_ENV === "development") {
    console.log(`🔐 Auth check for ${pathname}:`);
    console.log(`- isAuthenticated: ${isAuthenticated}`);
    console.log(`- isProtectedRoute: ${isProtectedRoute}`);
    console.log(`- isAuthRoute: ${isAuthRoute}`);
    console.log(`- debug cookie present: ${request.cookies.has("debug_session")}`);
  }
  
  // Redirect logic based on authentication status and route type
  // Skip all redirects in development mode if the flag is set
  if (process.env.NODE_ENV === "development" && bypassRedirectsInDevMode) {
    console.log('Debug: Skipping auth redirects in development mode');
    return NextResponse.next();
  }
  
  if (isAuthenticated) {
    // If user is logged in and tries to access auth pages, redirect to dashboard
    if (isAuthRoute) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    // If user is not logged in and tries to access protected pages, redirect to login
    if (isProtectedRoute) {
      // Store the original URL to redirect back after login
      const callbackUrl = encodeURIComponent(request.url);
      const redirectUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

// Add matcher for routes that should invoke this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
