// better-auth client configuration
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.plots.sh",
});

export const { useSession, signIn, signUp, signOut } = authClient;
