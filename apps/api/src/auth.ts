// Auth middleware and token validation
import { Context, Next } from "hono";
import { validateAPIToken } from "./users";
import { auth } from "./lib/auth";

type Variables = {
  userId: string;
  projectId: string;
};

export interface AuthEnv {
  BEARER_TOKEN?: string;
}

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  // Try API token first (Bearer token for CLI)
  const authHeader = c.req.header("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    
    if (token.startsWith("pl_live_") || token.startsWith("pl_test_")) {
      const userId = await validateAPIToken(token);
      
      if (userId) {
        c.set("userId", userId);
        await next();
        return;
      }
    }
  }

  // Try better-auth session (web)
  const cookie = c.req.header("Cookie");
  if (cookie) {
    try {
      const session = await auth.api.getSession({
        headers: { cookie },
      });
      
      if (session?.user) {
        c.set("userId", session.user.id);
        await next();
        return;
      }
    } catch (error) {
      // Session invalid or expired
    }
  }

  return c.json({ error: "Unauthorized" }, 401);
}

export function extractProjectId(c: Context<{ Variables: Variables }>): string {
  // Get from query parameter
  return c.req.query("project") || c.get("projectId") || "proj_demo";
}
