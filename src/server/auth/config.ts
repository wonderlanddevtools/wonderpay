import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      moniteEntityId?: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    moniteEntityId?: string;
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    CredentialsProvider({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password", placeholder: "" },
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // Find the user by email
          const user = await db.user.findUnique({
            where: { email },
          });

          // If no user found or password doesn't exist, return null
          if (!user?.password) {
            return null;
          }

          // Verify the password
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            return null;
          }

          // Return the user data for the session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            moniteEntityId: user.moniteEntityId ?? undefined,
          };
        } catch (error) {
          console.error("Error authenticating:", error);
          return null;
        }
      },
    }),
  ],
  // We use a mix of database and credentials auth
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login', // Error code passed in query string as ?error=
  },
  callbacks: {
    session: ({ session, token, user }) => {
      // When using JWT strategy, we receive token instead of user
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub ?? "",
            moniteEntityId: token.moniteEntityId as string | undefined,
          },
        };
      }
      
      // This branch is for database sessions (unlikely to be used with strategy: "jwt")
      return {
        ...session,
        user: {
          ...session.user,
          id: user?.id ?? "",
        },
      };
    },
    // Add JWT callback to include moniteEntityId in the token
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          moniteEntityId: user.moniteEntityId,
        };
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
