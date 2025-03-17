import { NextResponse } from "next/server";
import { moniteClient } from "~/server/monite/monite-client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * POST endpoint to create an entity user for the current user
 * This is used to set up proper permissions for accessing Monite API
 */
export async function POST() {
  try {
    // Only allow in development mode for safety
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "This endpoint is only available in development mode" },
        { status: 403 }
      );
    }

    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the user in the database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, moniteEntityId: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.moniteEntityId) {
      return NextResponse.json(
        { error: "User not associated with a Monite entity" },
        { status: 400 }
      );
    }

    // Create an entity user
    console.log(`Creating entity user for entity ${user.moniteEntityId} with email ${user.email}`);
    
    // Make sure the email exists - it should since we queried for it, but TypeScript needs this check
    if (!user.email) {
      return NextResponse.json(
        { error: "User email is required but not found" },
        { status: 400 }
      );
    }
    
    // Try to create the entity user
    const entityUserResult = await moniteClient.createEntityUser(
      user.moniteEntityId,
      user.email
    );

    // Test the entity user token to make sure it works
    const tokenResponse = await moniteClient.getEntityUserToken(user.moniteEntityId);

    return NextResponse.json({
      success: true,
      message: "Entity user created successfully",
      entityId: user.moniteEntityId,
      entityUser: entityUserResult,
      tokenWorks: !!tokenResponse.access_token
    });
  } catch (error) {
    console.error("Error creating entity user:", error);
    return NextResponse.json(
      { error: "Failed to create entity user", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if a user has valid entity user credentials
 */
export async function GET() {
  try {
    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the user in the database
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

    // Test the entity user token
    try {
      const tokenResponse = await moniteClient.getEntityUserToken(user.moniteEntityId);
      
      return NextResponse.json({
        success: true,
        hasValidCredentials: true,
        entityId: user.moniteEntityId,
        tokenExpiresIn: tokenResponse.expires_in
      });
    } catch (tokenError) {
      console.error("Token error:", tokenError);
      return NextResponse.json({
        success: false,
        hasValidCredentials: false,
        entityId: user.moniteEntityId,
        error: "Unable to obtain entity user token"
      });
    }
  } catch (error) {
    console.error("Error checking entity user credentials:", error);
    return NextResponse.json(
      { error: "Failed to check entity user credentials", details: String(error) },
      { status: 500 }
    );
  }
}
