import { moniteClient } from "~/server/monite/monite-client";
import { db } from "~/server/db";

/**
 * This script creates a Monite entity for testing and
 * assigns it to the test user account.
 */
async function main() {
  try {
    // First check if the test user exists
    const testUser = await db.user.findUnique({
      where: { email: "test@wonderpay.com" },
    });

    if (!testUser) {
      console.error("Test user not found. Please create it first.");
      process.exit(1);
    }

    console.log("Found test user:", testUser.id);

    // Check if the user already has an entity ID
    if (testUser.moniteEntityId) {
      console.log(
        "Test user already has a Monite entity ID:",
        testUser.moniteEntityId
      );
      process.exit(0);
    }

    // Create a test organization entity
    console.log("Creating Monite entity for test user...");
    const entityData = {
      name: "WonderPay Test Organization",
      type: "organization" as const,
      email: "test@wonderpay.com",
      tax_id: "123456789",
      address: {
        country: "US",
        city: "Los Angeles",
        postal_code: "90001",
        line1: "123 Test Street",
        state: "CA",
      },
      organization: {
        legal_name: "WonderPay Test Organization, LLC",
      },
    };

    const entityResult = await moniteClient.createEntity(entityData);
    console.log("Entity created successfully:", entityResult);

    // Extract the entity ID
    const entityId = (entityResult as { id: string }).id;
    if (!entityId) {
      throw new Error("Failed to get entity ID from response");
    }

    console.log("Entity ID:", entityId);

    // Update the user with the entity ID
    const updatedUser = await db.user.update({
      where: { id: testUser.id },
      data: {
        moniteEntityId: entityId,
      },
    });

    console.log(
      "User updated with Monite entity ID:",
      updatedUser.moniteEntityId
    );

    // Create an entity user for the test user
    console.log("Creating entity user...");
    
    // Since the email is guaranteed to exist (we queried by it), we can assert it's not null
    const email = testUser.email || "test@wonderpay.com"; // Fallback just in case
    
    const entityUserResult = await moniteClient.createEntityUser(
      entityId,
      email
    );
    console.log("Entity user created successfully:", entityUserResult);

    console.log("Setup complete!");
  } catch (error) {
    console.error("Error setting up Monite entity:", error);
    process.exit(1);
  }
}

main().catch(console.error);
