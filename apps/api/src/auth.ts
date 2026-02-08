// Auth middleware and token validation
import { Context, Next } from "hono";
import { validateAPIToken, validateSession } from "./users";

type Variables = {
  userId: string;
  projectId: string;
};

export interface AuthEnv {
  BEARER_TOKEN?: string;
}

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  // Try API token first (Bearer token)
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

  // Try session cookie (web)
  const sessionCookie = c.req.header("Cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("plots_session="))
    ?.split("=")[1];

  if (sessionCookie) {
    const userId = await validateSession(sessionCookie);
    
    if (userId) {
      c.set("userId", userId);
      await next();
      return;
    }
  }

  return c.json({ error: "Unauthorized" }, 401);
}

export function extractProjectId(c: Context<{ Variables: Variables }>): string {
  // Get from query parameter
  return c.req.query("project") || c.get("projectId") || "proj_demo";
}
