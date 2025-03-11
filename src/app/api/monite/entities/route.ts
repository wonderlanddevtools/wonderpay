import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createEntity, listEntities } from "~/server/monite/monite-api";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "~/server/email";

// Type definitions for entity data
type EntityAddress = {
  country: string;
  city: string;
  postal_code: string;
  line1: string;
  state?: string;
};

type OrganizationData = {
  legal_name: string;
  /* Add other organization fields as needed */
};

type IndividualData = {
  first_name: string;
  last_name: string;
  /* Add other individual fields as needed */
};

type EntityType = "organization" | "individual";

interface EntityData {
  name: string;
  type: EntityType;
  email: string;
  tax_id: string;
  address: EntityAddress;
  phone?: string;
  website?: string;
  organization?: OrganizationData;
  individual?: IndividualData;
  userData?: UserData;
}

interface EntityResult {
  id: string;
  [key: string]: unknown;
}

interface UserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * API route for listing all entities
 */
export async function GET() {
  try {
    const entitiesData = await listEntities() as Record<string, unknown>;
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
    const entityData = await request.json() as EntityData;
    
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
    
    if (!entityData.address?.country || !entityData.address?.city || 
        !entityData.address?.postal_code || !entityData.address?.line1) {
      return NextResponse.json(
        { error: "Complete address is required (country, city, postal_code, line1)" },
        { status: 400 }
      );
    }
    
    // Validate type-specific required fields
    if (entityData.type === "organization" && (!entityData.organization?.legal_name)) {
      return NextResponse.json(
        { error: "Organization legal name is required" },
        { status: 400 }
      );
    }
    
    if (entityData.type === "individual" && 
        (!entityData.individual?.first_name || !entityData.individual?.last_name)) {
      return NextResponse.json(
        { error: "Individual first name and last name are required" },
        { status: 400 }
      );
    }

    // Extract user data from the request if provided
    const userData: UserData | undefined = entityData.userData;
    // Create a copy of entity data without the userData property for the Monite API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userData: _unused, ...entityDataForApi } = entityData;
    
    // Create entity in Monite
    const result: EntityResult = await createEntity(entityDataForApi) as EntityResult;
    
    // If user data is provided, create a user in our database
    if (userData?.email && userData?.password) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create a user record linked to the Monite entity
        await db.user.create({
          data: {
            email: userData.email,
            name: `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim(),
            password: hashedPassword,
            moniteEntityId: result.id, // Store the Monite entity ID
          },
        });
        
        // Send verification email
        try {
          await sendVerificationEmail(userData.email);
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          // Continue with the flow even if email sending fails
        }
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
        if (error.message?.includes('{')) {
          const jsonStart = error.message.indexOf('{');
          const jsonPart = error.message.substring(jsonStart);
          const parsedError = JSON.parse(jsonPart);
          errorDetails = parsedError as Record<string, unknown>;
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
