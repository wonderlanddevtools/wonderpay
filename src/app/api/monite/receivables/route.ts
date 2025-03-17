/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { moniteClient } from "~/server/monite/monite-client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * GET endpoint to fetch all receivables (invoices) for the current user's entity
 * This is used in the Receivables module to display invoices
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Retrieve query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") ?? "100");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const status = searchParams.get("status"); // pending, paid, overdue, draft, etc.
    
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
    
    // Construct the query parameters for the receivables endpoint
    const queryParams: Record<string, string | number> = {
      limit,
      offset
    };
    
    // Add status filter if provided
    if (status) {
      queryParams.status = status;
    }
    
    // Call the Monite receivables endpoint
    const receivablesResponse = await moniteClient.request(
      '/receivables',
      {
        method: 'GET',
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(receivablesResponse);
  } catch (error) {
    console.error("Error fetching receivables:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch receivables" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to create a new receivable (invoice)
 * This is used in the Receivables module to create new invoices
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const receivableData = await request.json();
    
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
    
    // Call the Monite receivables endpoint to create a new receivable
    const receivableResponse = await moniteClient.request(
      '/receivables',
      {
        method: 'POST',
        body: receivableData,
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(receivableResponse);
  } catch (error) {
    console.error("Error creating receivable:", error);
    
    return NextResponse.json(
      { error: "Failed to create receivable" },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint to update a receivable's status
 * This is used to mark invoices as paid, sent, canceled, etc.
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { receivableId, status, action } = await request.json();
    
    if (!receivableId) {
      return NextResponse.json(
        { error: "Receivable ID is required" },
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
    
    // Determine the endpoint based on the action
    let endpoint = `/receivables/${receivableId}`;
    let body = {};
    
    // Handle different update types
    if (action === "status") {
      endpoint = `/receivables/${receivableId}/status`;
      body = { status };
    } else if (action === "send") {
      endpoint = `/receivables/${receivableId}/send`;
    } else if (action === "mark_as_paid") {
      endpoint = `/receivables/${receivableId}/mark_as_paid`;
    } else {
      // For standard update, use the parsed body excluding specific properties
      const { receivableId, status, action, ...restData } = await request.json();
      body = restData;
    }
    
    // Call the Monite receivables endpoint to update the receivable
    const receivableResponse = await moniteClient.request(
      endpoint,
      {
        method: 'PATCH',
        body,
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(receivableResponse);
  } catch (error) {
    console.error("Error updating receivable:", error);
    
    return NextResponse.json(
      { error: "Failed to update receivable" },
      { status: 500 }
    );
  }
}

/**
 * Special endpoint to generate a PDF for an invoice
 */
export async function PUT(request: NextRequest) {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { receivableId } = await request.json();
    
    if (!receivableId) {
      return NextResponse.json(
        { error: "Receivable ID is required" },
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
    
    // Call the Monite receivables endpoint to generate a PDF
    const pdfResponse = await moniteClient.request(
      `/receivables/${receivableId}/pdf`,
      {
        method: 'GET',
        entityId: user.moniteEntityId,
        token: tokenResponse.access_token
      }
    );
    
    return NextResponse.json(pdfResponse);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
