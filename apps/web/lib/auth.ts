// better-auth client configuration
import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.plots.sh";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { useSession, signIn, signUp, signOut } = authClient;
