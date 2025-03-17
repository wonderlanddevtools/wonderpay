"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

/**
 * A wrapper component that provides session context to the app
 * This is required for useSession hook to work properly
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
