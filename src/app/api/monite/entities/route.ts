import { NextRequest, NextResponse } from "next/server";
import { createEntity, listEntities } from "~/server/monite/monite-api";

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
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: "Entity name is required" },
        { status: 400 }
      );
    }

    const entityData = await createEntity(name);
    return NextResponse.json(entityData);
  } catch (error) {
    console.error("Error creating Monite entity:", error);
    return NextResponse.json(
      { error: "Failed to create Monite entity" },
      { status: 500 }
    );
  }
}
