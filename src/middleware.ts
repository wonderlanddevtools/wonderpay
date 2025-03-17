import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip for API routes, static files, and other non-page routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get the user's authentication status
  // Check for standard NextAuth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Also check for debug session cookie in development
  const hasDebugSessionCookie = request.cookies.has('debug_session');
  
  // User is authenticated if they have a token OR a debug session cookie in development
  const isAuthenticated = !!token || (isDevelopment && hasDebugSessionCookie);
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Enable debug logging
  console.log(`🔐 Auth check for ${pathname}:\n- isAuthenticated: ${isAuthenticated}\n- isProtectedRoute: ${isProtectedRoute}\n- isAuthRoute: ${isAuthRoute}\n- debug cookie present: ${request.cookies.has('debug-auth-bypass')}`);
  
  // Allow bypassing auth in development mode with a debug cookie
  const hasDebugCookie = request.cookies.has('debug-auth-bypass');

  // Redirect logic based on authentication status and route type
  if (isAuthenticated) {
    // If user is logged in and tries to access auth pages, redirect to dashboard
    if (isAuthRoute) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    // If user is not logged in and tries to access protected pages, redirect to login
    if (isProtectedRoute) {
      // Skip auth redirect in development mode with debug cookie
      if (isDevelopment && hasDebugCookie) {
        console.log("Debug: Skipping auth redirects in development mode");
        return NextResponse.next();
      }
      
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
