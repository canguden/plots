// better-auth client configuration
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "/", // Proxied through Next.js rewrites
});

export const { useSession, signIn, signUp, signOut } = authClient;
