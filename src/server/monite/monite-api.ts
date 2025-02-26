import { env } from "~/env";

/**
 * Function to fetch a token from the Monite API
 */
export async function fetchMoniteToken() {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_MONITE_API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-monite-version": "2024-05-25",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: env.MONITE_CLIENT_ID,
        client_secret: env.MONITE_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch token: ${JSON.stringify(errorData)}`);
    }

    return response.json();
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
    const response = await fetch(`${env.NEXT_PUBLIC_MONITE_API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-monite-version": "2024-05-25", 
      },
      body: JSON.stringify({
        grant_type: "entity_user",
        client_id: env.MONITE_CLIENT_ID,
        client_secret: env.MONITE_CLIENT_SECRET,
        entity_user_id: entityUserId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch entity user token: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching Monite entity user token:", error);
    throw error;
  }
}

/**
 * Creates an entity in Monite
 */
export async function createEntity(name: string) {
  try {
    // First, get a partner-level token
    const tokenResponse = await fetchMoniteToken();
    const { access_token } = tokenResponse;

    // Create the entity
    const response = await fetch(`${env.NEXT_PUBLIC_MONITE_API_URL}/entities`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2024-05-25",
      },
      body: JSON.stringify({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@wonderpay.example.com`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create entity: ${JSON.stringify(errorData)}`);
    }

    return response.json();
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
    // First, get a partner-level token
    const tokenResponse = await fetchMoniteToken();
    const { access_token } = tokenResponse;

    // Create the entity user
    const response = await fetch(`${env.NEXT_PUBLIC_MONITE_API_URL}/entity/${entityId}/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2024-05-25",
        "x-monite-entity-id": entityId,
      },
      body: JSON.stringify({
        email,
        role_id: role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create entity user: ${JSON.stringify(errorData)}`);
    }

    return response.json();
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
    // First, get a partner-level token
    const tokenResponse = await fetchMoniteToken();
    const { access_token } = tokenResponse;

    // List entities
    const response = await fetch(`${env.NEXT_PUBLIC_MONITE_API_URL}/entities`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "x-monite-version": "2024-05-25",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to list entities: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error listing Monite entities:", error);
    throw error;
  }
}
