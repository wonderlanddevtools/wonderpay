/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */

import { env } from "~/env";

/**
 * Environment types for Monite API
 */
export type MoniteEnvironment = "sandbox" | "production";

/**
 * Configuration for Monite API client
 */
export interface MoniteConfig {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  apiVersion: string;
  environment: MoniteEnvironment;
}

/**
 * Token response from Monite API
 */
export interface MoniteTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Monite API client for handling API interactions
 */
export class MoniteClient {
  private config: MoniteConfig;

  constructor(config?: Partial<MoniteConfig>) {
    // Default configuration from environment variables
    const defaultConfig: MoniteConfig = {
      clientId: env.MONITE_CLIENT_ID,
      clientSecret: env.MONITE_CLIENT_SECRET,
      apiUrl: env.NEXT_PUBLIC_MONITE_API_URL,
      apiVersion: "2023-06-04", // Using a stable API version
      environment: "sandbox", // Default to sandbox if not specified
    };

    // Merge default config with provided config
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get common headers for Monite API requests
   */
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-monite-version": this.config.apiVersion,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Fetches a partner-level token from the Monite API
   */
  async getToken(): Promise<MoniteTokenResponse> {
    try {
      console.log(`[MoniteClient] Fetching token for ${this.config.environment} environment...`);
      const tokenUrl = `${this.config.apiUrl}/auth/token`;
      
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[MoniteClient] Token error details:", errorData);
        throw new Error(`Failed to fetch token: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log("[MoniteClient] Token fetched successfully");
      return result;
    } catch (error) {
      console.error("[MoniteClient] Error fetching Monite token:", error);
      throw error;
    }
  }

  /**
   * Fetches an entity user token from the Monite API
   */
  async getEntityUserToken(entityUserId: string): Promise<MoniteTokenResponse> {
    try {
      console.log(`[MoniteClient] Fetching entity user token for: ${entityUserId}`);
      const tokenUrl = `${this.config.apiUrl}/auth/token`;
      
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          grant_type: "entity_user",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          entity_user_id: entityUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[MoniteClient] Entity user token error details:", errorData);
        throw new Error(`Failed to fetch entity user token: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log("[MoniteClient] Entity user token fetched successfully");
      return result;
    } catch (error) {
      console.error("[MoniteClient] Error fetching Monite entity user token:", error);
      throw error;
    }
  }

  /**
   * Generic method for making authenticated requests to the Monite API
   */
  async request<T = Record<string, unknown>>(
    endpoint: string,
    options: {
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      body?: Record<string, unknown>;
      entityId?: string;
      token?: string;
    }
  ): Promise<T> {
    try {
      // Get token if not provided
      const accessToken = options.token ?? (await this.getToken()).access_token;
      
      // Prepare headers
      const headers = this.getHeaders(accessToken);
      
      // Add entity ID if provided
      if (options.entityId) {
        headers["x-monite-entity-id"] = options.entityId;
      }
      
      // Prepare URL
      const url = `${this.config.apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
      
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
      };
      
      // Add body if provided
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }
      
      // Make request
      const response = await fetch(url, fetchOptions);
      
      // Handle errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[MoniteClient] Error in ${options.method} ${endpoint}:`, errorData);
        throw new Error(`Monite API error: ${JSON.stringify(errorData)}`);
      }
      
      // Parse response if it has content
      if (response.status !== 204) {
        const data = await response.json();
        return data as T;
      }
      
      // Return empty object if no content
      return {} as T;
    } catch (error) {
      console.error(`[MoniteClient] Error in ${options.method} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Creates an entity in Monite
   */
  async createEntity<T = Record<string, unknown>>(entityData: {
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
      console.log("[MoniteClient] Creating entity:", JSON.stringify(entityData));
      
      // Create the entity
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
      
      console.log("[MoniteClient] Entity creation payload:", JSON.stringify(requestBody));
      
      return this.request("/entities", {
        method: "POST",
        body: requestBody,
      });
    } catch (error) {
      console.error("[MoniteClient] Error creating Monite entity:", error);
      throw error;
    }
  }

  /**
   * List all entities
   */
  async listEntities<T = Record<string, unknown>>(): Promise<T> {
    try {
      console.log("[MoniteClient] Listing all entities...");
      
      return this.request("/entities", {
        method: "GET",
      });
    } catch (error) {
      console.error("[MoniteClient] Error listing Monite entities:", error);
      throw error;
    }
  }

  /**
   * Creates an entity user in Monite
   */
  async createEntityUser<T = Record<string, unknown>>(entityId: string, email: string, role?: string): Promise<T> {
    try {
      console.log(`[MoniteClient] Creating entity user for entity: ${entityId} with email: ${email}`);
      
      return this.request(`/entities/${entityId}/users`, {
        method: "POST",
        body: {
          email,
          role_id: role,
        },
        entityId,
      });
    } catch (error) {
      console.error("[MoniteClient] Error creating Monite entity user:", error);
      throw error;
    }
  }

  /**
   * Creates a bank account for an entity
   */
  async createBankAccount<T = Record<string, unknown>>(
    entityId: string, 
    bankAccountData: {
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
    }
  ) {
    try {
      console.log(`[MoniteClient] Creating bank account for entity: ${entityId}`);
      
      // First, get a token for the entity
      const tokenResponse = await this.getEntityUserToken(entityId);
      
      return this.request("/bank_accounts", {
        method: "POST",
        body: bankAccountData,
        entityId,
        token: tokenResponse.access_token,
      });
    } catch (error) {
      console.error("[MoniteClient] Error creating bank account:", error);
      throw error;
    }
  }

  /**
   * Lists all bank accounts for an entity
   */
  async listBankAccounts<T = Record<string, unknown>>(entityId: string): Promise<T> {
    try {
      console.log(`[MoniteClient] Listing bank accounts for entity: ${entityId}`);
      
      // First, get a token for the entity
      const tokenResponse = await this.getEntityUserToken(entityId);
      
      return this.request("/bank_accounts", {
        method: "GET",
        entityId,
        token: tokenResponse.access_token,
      });
    } catch (error) {
      console.error("[MoniteClient] Error listing bank accounts:", error);
      throw error;
    }
  }

  /**
   * Sets a bank account as default for its currency
   */
  async setDefaultBankAccount<T = Record<string, unknown>>(entityId: string, bankAccountId: string): Promise<T> {
    try {
      console.log(`[MoniteClient] Setting bank account as default: ${bankAccountId} for entity: ${entityId}`);
      
      // First, get a token for the entity
      const tokenResponse = await this.getEntityUserToken(entityId);
      
      return this.request(`/bank_accounts/${bankAccountId}/default`, {
        method: "POST",
        entityId,
        token: tokenResponse.access_token,
      });
    } catch (error) {
      console.error("[MoniteClient] Error setting default bank account:", error);
      throw error;
    }
  }

  /**
   * Deletes a bank account
   */
  async deleteBankAccount<T = Record<string, unknown>>(entityId: string, bankAccountId: string): Promise<T> {
    try {
      console.log(`[MoniteClient] Deleting bank account: ${bankAccountId} for entity: ${entityId}`);
      
      // First, get a token for the entity
      const tokenResponse = await this.getEntityUserToken(entityId);
      
      return this.request(`/bank_accounts/${bankAccountId}`, {
        method: "DELETE",
        entityId,
        token: tokenResponse.access_token,
      });
    } catch (error) {
      console.error("[MoniteClient] Error deleting bank account:", error);
      throw error;
    }
  }
}

/**
 * Create a singleton instance of MoniteClient
 */
export const moniteClient = new MoniteClient();

/**
 * Create a separate sandbox instance
 */
export const moniteSandboxClient = new MoniteClient({
  environment: "sandbox",
});

/**
 * Create a separate production instance
 */
export const moniteProductionClient = new MoniteClient({
  environment: "production",
});

/**
 * Helper function to get the appropriate client based on environment
 */
export function getMoniteClient(environment?: MoniteEnvironment): MoniteClient {
  if (environment === "production") {
    return moniteProductionClient;
  }
  if (environment === "sandbox") {
    return moniteSandboxClient;
  }
  return moniteClient; // Default client based on environment variables
}
