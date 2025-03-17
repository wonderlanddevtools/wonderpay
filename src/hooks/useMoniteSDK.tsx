import { MoniteSDK } from "@monite/sdk-api";
import { MoniteProvider } from "@monite/sdk-react";
import { useCallback, useMemo, useState } from "react";

/**
 * Custom hook to fetch a token for Monite API
 */
export const useMoniteToken = () => {
  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch("/api/monite/token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching Monite token:", error);
      throw error;
    }
  }, []);

  return { fetchToken };
};

/**
 * Custom hook for using the Monite SDK
 */
export const useMoniteSDK = (entityId?: string) => {
  const { fetchToken } = useMoniteToken();
  const [error, setError] = useState<Error | null>(null);

  const moniteSDK = useMemo(() => {
    if (!entityId) return null;

    try {
      return new MoniteSDK({
        apiUrl: process.env.NEXT_PUBLIC_MONITE_API_URL || "https://api.sandbox.monite.com/v1",
        entityId,
        fetchToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [entityId, fetchToken]);

  return { moniteSDK, error };
};

/**
 * MoniteProviderWrapper for wrapping Monite components
 */
interface MoniteProviderWrapperProps {
  entityId: string;
  children: React.ReactNode;
}

export const MoniteProviderWrapper: React.FC<MoniteProviderWrapperProps> = ({
  entityId,
  children,
}) => {
  const { moniteSDK, error } = useMoniteSDK(entityId);

  if (error) {
    return <div>Error initializing Monite SDK: {error.message}</div>;
  }

  if (!moniteSDK) {
    return <div>Loading Monite SDK...</div>;
  }

  return (
    <MoniteProvider 
      monite={moniteSDK}
    >
      {children}
    </MoniteProvider>
  );
};
