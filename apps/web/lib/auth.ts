// better-auth client configuration
import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") return "/"; // Browser uses proxy
  return process.env.NEXT_PUBLIC_APP_URL || "https://plots.sh"; // Server uses absolute URL
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { useSession, signIn, signUp, signOut } = authClient;
