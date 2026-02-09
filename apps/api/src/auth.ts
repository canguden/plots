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
  // Bypassing auth check for auth endpoints themselves to avoid redirect loops
  // and issues during login/signup processes.
  if (c.req.path.startsWith("/api/auth/")) {
    await next();
    return;
  }

  // Try API token first (Bearer token for CLI)
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    // Accept tokens with various prefixes (pl_live_, pl_test_, plots_)
    if (token.startsWith("pl_live_") || token.startsWith("pl_test_") || token.startsWith("plots_")) {
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
      } else {
        console.log("[Auth] No session user found, cookie present but session invalid");
      }
    } catch (error) {
      // Session invalid or expired
      console.log("[Auth] Session error:", error instanceof Error ? error.message : error);
    }
  } else {
    console.log("[Auth] No cookie header present");
  }

  return c.json({ error: "Unauthorized" }, 401);
}

export async function verifyProjectOwnership(userId: string, projectId: string): Promise<boolean> {
  const { getProjectById } = await import("./users");
  try {
    const project = await getProjectById(projectId, userId);
    return project !== null;
  } catch {
    return false;
  }
}

export function extractProjectId(c: Context<{ Variables: Variables }>): string {
  const projectId = c.req.query("project");
  if (!projectId) {
    throw new Error("Project ID required");
  }
  return projectId;
}
