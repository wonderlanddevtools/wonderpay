"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
};

type IndividualData = {
  first_name: string;
  last_name: string;
};

type EntityType = "organization" | "individual";

interface EntityData {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
  status?: string;
}

interface UserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface ListEntitiesResponse {
  data: EntityData[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Hook for managing Monite entities
 */
export function useEntities() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Get all entities
  const getEntities = useQuery<ListEntitiesResponse, Error>({
    queryKey: ["entities", searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/monite/entities?search=${encodeURIComponent(searchTerm)}`
        : "/api/monite/entities";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to fetch entities");
      }
      
      return response.json() as Promise<ListEntitiesResponse>;
    },
  });

  // Create a new entity
  const createEntity = useMutation<EntityData, Error, Omit<EntityData, "id">>({
    mutationFn: async (entityData) => {
      const response = await fetch("/api/monite/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entityData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? "Failed to create entity");
      }
      
      return response.json() as Promise<EntityData>;
    },
    onSuccess: () => {
      // Invalidate entities queries to trigger a refetch
      void queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
  
  // Filter entities based on search term
  const filterEntities = (entities: EntityData[] = []): EntityData[] => {
    if (!searchTerm) return entities;
    
    return entities.filter(entity => {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Search in different entity fields
      return (
        entity.name?.toLowerCase().includes(searchTermLower) ||
        entity.email?.toLowerCase().includes(searchTermLower) ||
        entity.tax_id?.includes(searchTermLower) ||
        entity.organization?.legal_name?.toLowerCase().includes(searchTermLower) ||
        (
          entity.individual && (
            entity.individual.first_name?.toLowerCase().includes(searchTermLower) ||
            entity.individual.last_name?.toLowerCase().includes(searchTermLower)
          )
        )
      );
    });
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  
  // Get entity display name based on type
  const getEntityDisplayName = (entity: EntityData): string => {
    if (entity.type === "organization" && entity.organization?.legal_name) {
      return entity.organization.legal_name;
    }
    
    if (entity.type === "individual" && entity.individual) {
      const { first_name, last_name } = entity.individual;
      return `${first_name} ${last_name}`.trim();
    }
    
    return entity.name ?? "Unnamed Entity";
  };
  
  return {
    // Data fetching
    entities: getEntities.data?.data ?? [],
    filteredEntities: getEntities.data ? filterEntities(getEntities.data.data) : [],
    isLoading: getEntities.isLoading,
    isError: getEntities.isError,
    error: getEntities.error,
    refetch: getEntities.refetch,
    
    // Mutations
    createEntity: createEntity.mutate,
    isCreating: createEntity.isPending,
    
    // Searching
    searchTerm,
    setSearchTerm,
    
    // Utility functions
    formatDate,
    getEntityDisplayName,
    filterEntities,
  };
}
