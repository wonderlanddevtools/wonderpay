import { NextRequest, NextResponse } from "next/server";
import { createEntity, listEntities } from "~/server/monite/monite-api";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

/**
 * API route for listing all entities
 */
export async function GET() {
  try {
    const entitiesData = await listEntities();
    return NextResponse.json(entitiesData);
  } catch (error) {
    console.error("Error listing Monite entities:", error);
    return NextResponse.json(
      { error: "Failed to list Monite entities" },
      { status: 500 }
    );
  }
}

/**
 * API route for creating a new entity
 */
export async function POST(request: NextRequest) {
  try {
    const entityData = await request.json();
    
    // Validate required fields
    if (!entityData.type) {
      return NextResponse.json(
        { error: "Entity type is required (organization or individual)" },
        { status: 400 }
      );
    }
    
    if (!entityData.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    if (!entityData.tax_id) {
      return NextResponse.json(
        { error: "Tax ID is required" },
        { status: 400 }
      );
    }
    
    if (!entityData.address || !entityData.address.country || !entityData.address.city || 
        !entityData.address.postal_code || !entityData.address.line1) {
      return NextResponse.json(
        { error: "Complete address is required (country, city, postal_code, line1)" },
        { status: 400 }
      );
    }
    
    // Validate type-specific required fields
    if (entityData.type === "organization" && (!entityData.organization || !entityData.organization.legal_name)) {
      return NextResponse.json(
        { error: "Organization legal name is required" },
        { status: 400 }
      );
    }
    
    if (entityData.type === "individual" && 
        (!entityData.individual || !entityData.individual.first_name || !entityData.individual.last_name)) {
      return NextResponse.json(
        { error: "Individual first name and last name are required" },
        { status: 400 }
      );
    }

    // Extract user data from the request if provided
    const userData = entityData.userData;
    delete entityData.userData; // Remove userData before sending to Monite API
    
    // Create entity in Monite
    const result = await createEntity(entityData);
    
    // If user data is provided, create a user in our database
    if (userData && userData.email && userData.password) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create a user record linked to the Monite entity
        await db.user.create({
          data: {
            email: userData.email,
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            password: hashedPassword,
            moniteEntityId: result.id, // Store the Monite entity ID
          },
        });
      } catch (userError) {
        console.error("Error creating user record:", userError);
        // We'll still return the entity result even if user creation fails
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating Monite entity:", error);
    
    // Detailed error response
    let errorMessage = "Failed to create Monite entity";
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error stack:", error.stack);
      
      // Try to parse JSON error message if it exists
      try {
        if (error.message.includes('{')) {
          const jsonStart = error.message.indexOf('{');
          const jsonPart = error.message.substring(jsonStart);
          errorDetails = JSON.parse(jsonPart);
          console.error("Parsed error details:", errorDetails);
        }
      } catch (parseError) {
        console.error("Could not parse error details:", parseError);
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
