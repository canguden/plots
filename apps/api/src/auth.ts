// Auth middleware and token validation
import { Context, Next } from "hono";

type Variables = {
  userId: string;
  projectId: string;
};

export interface AuthEnv {
  BEARER_TOKEN?: string;
}

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  
  // Validate token format
  if (!token.startsWith("pl_live_")) {
    return c.json({ error: "Invalid token format" }, 401);
  }

  // In production, validate against database
  // For now, simple validation
  const validToken = process.env.BEARER_TOKEN || "pl_live_dev_token";
  
  if (token !== validToken) {
    return c.json({ error: "Invalid token" }, 401);
  }

  // Store user context
  c.set("userId", "user_1"); // In production, get from token
  c.set("projectId", "proj_1"); // In production, get from token or query
  
  await next();
}

export function extractProjectId(c: Context<{ Variables: Variables }>): string {
  return c.req.query("project") || c.get("projectId") || "proj_1";
}
