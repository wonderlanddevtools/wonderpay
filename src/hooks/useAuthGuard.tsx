"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AuthGuardOptions = {
  /**
   * If true, the hook will redirect to the login page if the user is not authenticated
   * If false, the hook will redirect to the dashboard if the user is authenticated
   */
  requireAuth: boolean;
  /**
   * Where to redirect if the auth check fails
   * Default: '/login' when requireAuth is true, '/dashboard' when requireAuth is false
   */
  redirectTo?: string;
  /**
   * If true, the hook will skip the redirect in development mode
   * This can be useful for testing and development
   */
  skipRedirectInDevMode?: boolean;
};

/**
 * Hook that checks for authentication state and redirects accordingly
 * Can be used for both protected routes and auth-only routes
 */
export function useAuthGuard({
  requireAuth = true,
  redirectTo,
  skipRedirectInDevMode = false,
}: AuthGuardOptions) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Set default redirects based on requireAuth
  const defaultRedirect = requireAuth ? "/login" : "/dashboard";
  const finalRedirectTo = redirectTo ?? defaultRedirect;

  // Get the current URL for the callback parameter
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const callbackUrl = encodeURIComponent(currentUrl);
  const loginWithCallback = `/login?callbackUrl=${callbackUrl}`;

  useEffect(() => {
    // Wait until session loading is complete
    if (status === "loading") {
      return;
    }

    // Skip redirect in development if the option is enabled
    if (
      process.env.NODE_ENV === "development" &&
      skipRedirectInDevMode
    ) {
      console.log(
        `🛠️ [Dev] Auth check skipped for ${pathname} (requireAuth: ${requireAuth})`
      );
      setIsChecking(false);
      return;
    }

    // Check auth state and redirect if needed
    const isAuthenticated = !!session;
    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      console.log(`🔒 Auth required but user not authenticated, redirecting to ${loginWithCallback}`);
      router.push(loginWithCallback);
    } else if (!requireAuth && isAuthenticated) {
      // User is authenticated but shouldn't be for this route
      console.log(`🔓 User authenticated but route requires no auth, redirecting to ${finalRedirectTo}`);
      router.push(finalRedirectTo);
    } else {
      // Auth state matches requirements, no redirect needed
      setIsChecking(false);
    }
  }, [
    status,
    session,
    router,
    requireAuth,
    finalRedirectTo,
    pathname,
    skipRedirectInDevMode,
    loginWithCallback,
  ]);

  return {
    isAuthenticated: !!session,
    isLoading: status === "loading" || isChecking,
    session,
    user: session?.user,
  };
}

/**
 * A simpler hook that just returns the authentication state
 * without performing any redirects
 */
export function useAuthState() {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: !!session,
    isLoading: status === "loading",
    session,
    user: session?.user,
  };
}
