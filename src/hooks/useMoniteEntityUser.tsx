import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

/**
 * This hook manages the entity user for Monite API integration
 * It checks if the current user has valid entity user credentials
 * and provides functions to create or fix them if needed
 */
export function useMoniteEntityUser() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [hasEntityId, setHasEntityId] = useState(false);
  const [hasValidCredentials, setHasValidCredentials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the user has valid entity user credentials
  const checkEntityUser = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      setHasEntityId(false);
      setHasValidCredentials(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/monite/entity-users");
      const data = await response.json();
      
      if (response.ok) {
        setHasEntityId(true);
        setHasValidCredentials(data.hasValidCredentials);
      } else {
        setHasEntityId(false);
        setHasValidCredentials(false);
        setError(data.error || "Failed to check entity user status");
      }
    } catch (err) {
      setHasEntityId(false);
      setHasValidCredentials(false);
      setError("Error checking entity user status");
      console.error("Error checking entity user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  // Create an entity user for the current user
  const createEntityUser = useCallback(async () => {
    if (!session?.user) {
      setError("You must be logged in to create an entity user");
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/monite/entity-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setHasEntityId(true);
        setHasValidCredentials(true);
        return true;
      } else {
        setError(data.error || "Failed to create entity user");
        return false;
      }
    } catch (err) {
      setError("Error creating entity user");
      console.error("Error creating entity user:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  // Check entity user status on mount and when session changes
  useEffect(() => {
    checkEntityUser();
  }, [checkEntityUser]);
  
  return {
    isLoading,
    hasEntityId,
    hasValidCredentials,
    error,
    checkEntityUser,
    createEntityUser,
    
    // Convenience computed properties
    isReady: hasEntityId && hasValidCredentials,
    needsSetup: !isLoading && (!hasEntityId || !hasValidCredentials),
  };
}
