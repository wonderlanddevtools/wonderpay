import { NextResponse } from "next/server";
import { fetchMoniteToken } from "~/server/monite/monite-api";

/**
 * API route for fetching a Monite token
 * 
 * This is a server-side endpoint that securely generates a Monite token,
 * ensuring the client_secret isn't exposed in the browser.
 */
export async function GET() {
  try {
    const tokenData = await fetchMoniteToken();
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Error fetching Monite token:", error);
    return NextResponse.json(
      { error: "Failed to fetch Monite token" },
      { status: 500 }
    );
  }
}
