import { useState } from "react";
import { useMoniteEntityUser } from "~/hooks/useMoniteEntityUser";

/**
 * This component checks if the user has a valid Monite entity user
 * and provides a way to set it up if needed.
 * It should be shown on dashboard pages to ensure API access works.
 */
export function EntityUserSetup() {
  const {
    isLoading,
    hasEntityId,
    hasValidCredentials,
    error,
    needsSetup,
    createEntityUser,
  } = useMoniteEntityUser();
  
  const [isCreating, setIsCreating] = useState(false);
  
  // Handle setup click
  const handleSetup = async () => {
    setIsCreating(true);
    
    try {
      await createEntityUser();
    } finally {
      setIsCreating(false);
    }
  };
  
  // Don't show anything if there's no need for setup
  if (!needsSetup) {
    return null;
  }
  
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm">
      <h3 className="mb-2 font-semibold">Monite API Setup Required</h3>
      
      <p className="mb-3 text-sm">
        {!hasEntityId
          ? "Your account does not have a Monite entity. This is required to access financial features."
          : !hasValidCredentials
          ? "Your Monite entity user credentials need to be set up to access financial features."
          : "Your Monite integration needs to be configured."}
      </p>
      
      {error && (
        <div className="mb-3 rounded bg-red-50 p-2 text-xs text-red-600">
          Error: {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleSetup}
          disabled={isLoading || isCreating}
          className="rounded bg-amber-600 px-3 py-1 text-sm text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "Checking..."
            : isCreating
            ? "Setting up..."
            : "Set up Monite User"}
        </button>
      </div>
    </div>
  );
}
