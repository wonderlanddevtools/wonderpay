/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { moniteClient } from "~/server/monite/monite-client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * GET endpoint to fetch all payables for the current user's entity
 * This is used in the Bill Pay module to display bills to pay
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user's session using the new auth() API
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Retrieve limit and offset from query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") ?? "100");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const status = searchParams.get("status"); // pending, paid, canceled, etc.
    
    // Find the user in the database to get their Monite entity ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { moniteEntityId: true }
    });
    
    if (!user?.moniteEntityId) {
      return NextResponse.json(
        { error: "User not associated with a Monite entity" },
        { status: 400 }
      );
    }
    
    // Get an entity token for the user
    const tokenResponse = await moniteClient.getEntityUserToken(user.moniteEntityId);
    
    // Construct the query parameters for the payables endpoint
    const queryParams: Record<string, string | number> = {
      limit,
      offset
    };
    
    // Add status filter if provided
    if (status) {
      queryParams.status = status;
    }
    
    // Call the Monite payables endpoint
    const payablesResponse = await moniteClient.request(
      '/payables',
      {
        method: 'GET',
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(payablesResponse);
  } catch (error) {
    console.error("Error fetching payables:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch payables" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to create a new payable (bill to pay)
 * This is used in the Bill Pay module to add new bills
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user's session using the new auth() API
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const payableData = await request.json();
    
    // Find the user in the database to get their Monite entity ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { moniteEntityId: true }
    });
    
    if (!user?.moniteEntityId) {
      return NextResponse.json(
        { error: "User not associated with a Monite entity" },
        { status: 400 }
      );
    }
    
    // Get an entity token for the user
    const tokenResponse = await moniteClient.getEntityUserToken(user.moniteEntityId);
    
    // Call the Monite payables endpoint to create a new payable
    const payableResponse = await moniteClient.request(
      '/payables',
      {
        method: 'POST',
        body: payableData,
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(payableResponse);
  } catch (error) {
    console.error("Error creating payable:", error);
    
    return NextResponse.json(
      { error: "Failed to create payable" },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint to update a payable's status
 * This is used to mark bills as paid, canceled, etc.
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get the user's session using the new auth() API
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { payableId, status } = await request.json();
    
    if (!payableId) {
      return NextResponse.json(
        { error: "Payable ID is required" },
        { status: 400 }
      );
    }
    
    // Find the user in the database to get their Monite entity ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { moniteEntityId: true }
    });
    
    if (!user?.moniteEntityId) {
      return NextResponse.json(
        { error: "User not associated with a Monite entity" },
        { status: 400 }
      );
    }
    
    // Get an entity token for the user
    const tokenResponse = await moniteClient.getEntityUserToken(user.moniteEntityId);
    
    // Call the Monite payables endpoint to update the payable
    const payableResponse = await moniteClient.request(
      `/payables/${payableId}/status`,
      {
        method: 'PATCH',
        body: { status },
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(payableResponse);
  } catch (error) {
    console.error("Error updating payable status:", error);
    
    return NextResponse.json(
      { error: "Failed to update payable status" },
      { status: 500 }
    );
  }
}
