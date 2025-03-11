import { env } from "~/env";

/**
 * Function to fetch a token from the Monite API
 */
export async function fetchMoniteToken() {
  try {
    console.log("Fetching Monite token...");
    const tokenUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/auth/token`;
    console.log("Token URL:", tokenUrl);
    
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",  // Using a stable API version
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: env.MONITE_CLIENT_ID,
        client_secret: env.MONITE_CLIENT_SECRET,
      }),
    });

    console.log("Token response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token error details:", errorData);
      throw new Error(`Failed to fetch token: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Token fetched successfully");
    return result;
  } catch (error) {
    console.error("Error fetching Monite token:", error);
    throw error;
  }
}

/**
 * Function to fetch an entity user token from the Monite API
 */
export async function fetchMoniteEntityUserToken(entityUserId: string) {
  try {
    console.log("Fetching entity user token for:", entityUserId);
    const tokenUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/auth/token`;
    console.log("Token URL:", tokenUrl);
    
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",  // Using a stable API version
      },
      body: JSON.stringify({
        grant_type: "entity_user",
        client_id: env.MONITE_CLIENT_ID,
        client_secret: env.MONITE_CLIENT_SECRET,
        entity_user_id: entityUserId,
      }),
    });

    console.log("Entity user token response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Entity user token error details:", errorData);
      throw new Error(`Failed to fetch entity user token: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Entity user token fetched successfully");
    return result;
  } catch (error) {
    console.error("Error fetching Monite entity user token:", error);
    throw error;
  }
}

/**
 * Creates an entity in Monite
 */
export async function createEntity(entityData: {
  name: string;
  type: "organization" | "individual";
  email: string;
  tax_id: string;
  address: {
    country: string;
    city: string;
    postal_code: string;
    line1: string;
    state?: string;
  };
  phone?: string;
  website?: string;
  organization?: {
    legal_name: string;
    business_structure?: string;
    representative_provided?: boolean;
    directors_provided?: boolean;
    executives_provided?: boolean;
    owners_provided?: boolean;
    legal_entity_id?: string;
  };
  individual?: {
    first_name: string;
    last_name: string;
    id_number?: string;
    ssn_last_4?: string;
  };
}) {
  try {
    console.log("Creating entity:", JSON.stringify(entityData));
    
    // First, get a partner-level token
    const tokenResponse = await fetchMoniteToken();
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for entity creation");
    
    // Create the entity
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/entities`;
    console.log("API URL for entity creation:", apiUrl);
    
    // Make a properly formatted request according to Monite API docs
    const requestBody = {
      type: entityData.type,
      email: entityData.email,
      tax_id: entityData.tax_id,
      address: entityData.address,
      phone: entityData.phone,
      website: entityData.website,
    };
    
    // Add organization data if type is organization
    if (entityData.type === "organization" && entityData.organization) {
      Object.assign(requestBody, { organization: entityData.organization });
    }
    
    // Add individual data if type is individual
    if (entityData.type === "individual" && entityData.individual) {
      Object.assign(requestBody, { individual: entityData.individual });
    }
    
    console.log("Entity creation payload:", JSON.stringify(requestBody));
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",  // Using a stable API version
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Entity creation response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Entity creation error details:", errorData);
      throw new Error(`Failed to create entity: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Entity created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating Monite entity:", error);
    throw error;
  }
}

/**
 * Creates an entity user in Monite
 */
export async function createEntityUser(entityId: string, email: string, role?: string) {
  try {
    console.log("Creating entity user for entity:", entityId, "with email:", email);
    
    // First, get a partner-level token
    const tokenResponse = await fetchMoniteToken();
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for entity user creation");
    
    // Create the entity user
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/entity/${entityId}/users`;
    console.log("API URL for entity user creation:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",  // Using a stable API version
        "x-monite-entity-id": entityId,
      },
      body: JSON.stringify({
        email,
        role_id: role,
      }),
    });

    console.log("Entity user creation response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Entity user creation error details:", errorData);
      throw new Error(`Failed to create entity user: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Entity user created successfully");
    return result;
  } catch (error) {
    console.error("Error creating Monite entity user:", error);
    throw error;
  }
}

/**
 * List all entities
 */
export async function listEntities() {
  try {
    console.log("Listing all entities...");
    
    // First, get a partner-level token
    const tokenResponse = await fetchMoniteToken();
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for listing entities");
    
    // List entities
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/entities`;
    console.log("API URL for listing entities:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",  // Using a stable API version
      },
    });

    console.log("List entities response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("List entities error details:", errorData);
      throw new Error(`Failed to list entities: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Entities listed successfully");
    return result;
  } catch (error) {
    console.error("Error listing Monite entities:", error);
    throw error;
  }
}

/**
 * Creates a bank account for an entity
 */
export async function createBankAccount(entityId: string, bankAccountData: {
  iban?: string;
  bic?: string;
  account_number?: string;
  routing_number?: string;
  sort_code?: string;
  bank_name?: string;
  display_name?: string;
  is_default_for_currency?: boolean;
  account_holder_name: string;
  currency: string;
  country: string;
}) {
  try {
    console.log("Creating bank account for entity:", entityId);
    
    // First, get a token for the entity
    const tokenResponse = await fetchMoniteEntityUserToken(entityId);
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for bank account creation");
    
    // Create the bank account
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/bank_accounts`;
    console.log("API URL for bank account creation:", apiUrl);
    
    console.log("Bank account creation payload:", JSON.stringify(bankAccountData));
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",
        "x-monite-entity-id": entityId,
      },
      body: JSON.stringify(bankAccountData),
    });

    console.log("Bank account creation response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Bank account creation error details:", errorData);
      throw new Error(`Failed to create bank account: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Bank account created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating bank account:", error);
    throw error;
  }
}

/**
 * Lists all bank accounts for an entity
 */
export async function listBankAccounts(entityId: string) {
  try {
    console.log("Listing bank accounts for entity:", entityId);
    
    // First, get a token for the entity
    const tokenResponse = await fetchMoniteEntityUserToken(entityId);
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for listing bank accounts");
    
    // List the bank accounts
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/bank_accounts`;
    console.log("API URL for listing bank accounts:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",
        "x-monite-entity-id": entityId,
      },
    });

    console.log("Bank accounts list response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Bank accounts list error details:", errorData);
      throw new Error(`Failed to list bank accounts: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Bank accounts listed successfully:", result);
    return result;
  } catch (error) {
    console.error("Error listing bank accounts:", error);
    throw error;
  }
}

/**
 * Deletes a bank account
 */
export async function deleteBankAccount(entityId: string, bankAccountId: string) {
  try {
    console.log("Deleting bank account:", bankAccountId, "for entity:", entityId);
    
    // First, get a token for the entity
    const tokenResponse = await fetchMoniteEntityUserToken(entityId);
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for bank account deletion");
    
    // Delete the bank account
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/bank_accounts/${bankAccountId}`;
    console.log("API URL for bank account deletion:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",
        "x-monite-entity-id": entityId,
      },
    });

    console.log("Bank account deletion response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Bank account deletion error details:", errorData);
      throw new Error(`Failed to delete bank account: ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting bank account:", error);
    throw error;
  }
}

/**
 * Sets a bank account as default for its currency
 */
export async function setDefaultBankAccount(entityId: string, bankAccountId: string) {
  try {
    console.log("Setting bank account as default:", bankAccountId, "for entity:", entityId);
    
    // First, get a token for the entity
    const tokenResponse = await fetchMoniteEntityUserToken(entityId);
    const { access_token } = tokenResponse;
    
    console.log("Successfully obtained token for setting default bank account");
    
    // Set the bank account as default
    const apiUrl = `${env.NEXT_PUBLIC_MONITE_API_URL}/bank_accounts/${bankAccountId}/default`;
    console.log("API URL for setting default bank account:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2023-06-04",
        "x-monite-entity-id": entityId,
      },
    });

    console.log("Set default bank account response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Set default bank account error details:", errorData);
      throw new Error(`Failed to set default bank account: ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error("Error setting default bank account:", error);
    throw error;
  }
}
