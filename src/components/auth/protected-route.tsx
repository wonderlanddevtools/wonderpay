"use client";

import { ReactNode } from "react";
import { useAuthGuard } from "../../hooks/useAuthGuard";

interface ProtectedRouteProps {
  /** Children to render when authenticated */
  children: ReactNode;
  /** Where to redirect if auth fails (defaults to /login) */
  redirectTo?: string;
  /** Custom loading component */
  loading?: ReactNode;
  /** If true, will skip redirect in development mode */
  skipRedirectInDevMode?: boolean;
  /** Component to render when not authenticated (instead of redirecting) */
  fallback?: ReactNode;
}

/**
 * Component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo,
  loading,
  skipRedirectInDevMode = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthGuard({
    requireAuth: true,
    redirectTo,
    skipRedirectInDevMode,
  });

  // Custom loading component or default loading state
  if (isLoading) {
    return loading !== undefined ? loading : (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and fallback is provided, show fallback
  // (This will only happen in development with skipRedirectInDevMode
  // or momentarily before the redirect happens)
  if (!isAuthenticated && fallback) {
    return fallback;
  }

  // If authenticated, render children
  return <>{children}</>;
}

/**
 * Component that protects routes that should only be accessible when NOT authenticated
 * (e.g., login, signup pages)
 * Redirects to dashboard if user is already authenticated
 */
export function PublicOnlyRoute({
  children,
  redirectTo,
  loading,
  skipRedirectInDevMode = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthGuard({
    requireAuth: false,
    redirectTo,
    skipRedirectInDevMode,
  });

  // Custom loading component or default loading state
  if (isLoading) {
    return loading !== undefined ? loading : (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated and fallback is provided, show fallback
  // (This will only happen in development with skipRedirectInDevMode
  // or momentarily before the redirect happens)
  if (isAuthenticated && fallback) {
    return fallback;
  }

  // If not authenticated, render children
  return <>{children}</>;
}
