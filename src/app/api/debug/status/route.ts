import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple diagnostic endpoint to help debug cookie and session issues
export function GET(request: NextRequest) {
  // Collect basic request information
  const cookieList = cookies().getAll();
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  const url = request.url;
  
  // Format cookies for display, masking sensitive values
  const safeCookies = cookieList.map(cookie => {
    let safeValue = cookie.value;
    // Mask JWT values to avoid exposing sensitive data
    if (cookie.name === "debug_session" || cookie.name.includes("next-auth")) {
      safeValue = `${safeValue.substring(0, 10)}...`;
    }
    
    return {
      name: cookie.name,
      value: safeValue,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      maxAge: cookie.maxAge
    };
  });
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    request: {
      url,
      userAgent,
      referer
    },
    cookies: safeCookies,
    debug: true
  });
}
