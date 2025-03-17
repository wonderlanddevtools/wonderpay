/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from 'next/server';

// Import mock data from parent route
import { MOCK_APPLICATIONS } from '../route';

/**
 * GET /api/capital/applications/[id]
 * Get a specific capital application by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // For development, we're skipping authentication checks
    // In production, we would verify the user is authenticated and has access to this application
    
    // Find the application in mock data
    const application = MOCK_APPLICATIONS.find((app: {id: string}) => app.id === id);
    
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error fetching capital application:", error);
    return NextResponse.json(
      { error: "Failed to fetch capital application" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/capital/applications/[id]
 * Update a specific capital application
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // For development, we're skipping authentication checks
    // In production, we would verify the user is authenticated and has access to this application
    
    // Find the application in mock data
    const applicationIndex = MOCK_APPLICATIONS.findIndex((app: {id: string}) => app.id === id);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const updateData = await req.json();
    
    // Basic validation for required fields
    if (!updateData.entity_id) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }
    
    // Mock application update
    // In production, we would update the database
    const updatedApplication = {
      ...MOCK_APPLICATIONS[applicationIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // Store the updated application in our mock data
    // Note: This is just for demonstration, as the mock data won't persist across requests
    // In production, we would update the database
    MOCK_APPLICATIONS[applicationIndex] = updatedApplication;
    
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating capital application:", error);
    return NextResponse.json(
      { error: "Failed to update capital application" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/capital/applications/[id]
 * Delete a capital application (only if it's a draft)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // For development, we're skipping authentication checks
    // In production, we would verify the user is authenticated and has access to this application
    
    // Find the application in mock data
    const applicationIndex = MOCK_APPLICATIONS.findIndex((app: {id: string}) => app.id === id);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Get the application from the array
    const application = MOCK_APPLICATIONS[applicationIndex];
    
    // Check if application is in draft status
    if (application && application.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft applications can be deleted" },
        { status: 400 }
      );
    }
    
    // Mock application deletion
    // In production, we would delete from the database
    MOCK_APPLICATIONS.splice(applicationIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting capital application:", error);
    return NextResponse.json(
      { error: "Failed to delete capital application" },
      { status: 500 }
    );
  }
}
