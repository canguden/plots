// Hono backend - main entry point
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { authMiddleware, extractProjectId } from "./auth";
import { ingestEvent } from "./ingest";
import { ensureSchema } from "./db";
import { initializeUserSchema } from "./schema";
import {
  getOverview,
  getPages,
  getReferrers,
  getCountries,
  getDevices,
  getEvents,
} from "./queries";
import { getUsage, createCheckoutSession, handleWebhook } from "./billing";
import {
  createAPIToken,
  getUserProjects,
  createProject,
  getProjectById,
  getUserById,
} from "./users";

// Define Hono context types
type Variables = {
  userId: string;
  projectId: string;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: process.env.WEB_URL || "http://localhost:3000",
  credentials: true,
}));

// Public endpoints
app.post("/ingest", ingestEvent);

// Better-auth endpoints - handles /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Backward compatibility - redirect old endpoints to better-auth
app.post("/auth/signup", async (c) => {
  const body = await c.req.json();
  const response = await auth.api.signUpEmail({
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  });
  
  if (!response) {
    return c.json({ error: "Signup failed" }, 400);
  }
  
  // Create default project for new user
  if (response.user) {
    await createProject(response.user.id, "My Website", "example.com");
  }
  
  return c.json(response);
});

app.post("/auth/login", async (c) => {
  const body = await c.req.json();
  const response = await auth.api.signInEmail({
    body: {
      email: body.email,
      password: body.password,
    },
  });
  
  if (!response) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  
  return c.json(response);
});

app.post("/auth/logout", async (c) => {
  const cookie = c.req.header("Cookie");
  if (cookie) {
    await auth.api.signOut({
      headers: { cookie },
    });
  }
  return c.json({ success: true });
});

app.get("/auth/me", async (c) => {
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ error: "Not authenticated" }, 401);
  }
  
  const session = await auth.api.getSession({
    headers: { cookie },
  });
  
  if (!session?.user) {
    return c.json({ error: "Invalid session" }, 401);
  }

  return c.json({ user: session.user });
});

// Webhook endpoint (no auth)
app.post("/webhook/stripe", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("stripe-signature");

  if (!signature) {
    return c.json({ error: "No signature" }, 400);
  }

  try {
    const result = await handleWebhook(body, signature);
    return c.json(result);
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: "Webhook failed" }, 400);
  }
});

// Protected endpoints
app.use("/api/*", authMiddleware);

app.get("/api/overview", async (c) => {
  const projectId = extractProjectId(c);
  const range = c.req.query("range") || "7d";
  const data = await getOverview(projectId, range);
  return c.json(data);
});

app.get("/api/pages", async (c) => {
  const projectId = extractProjectId(c);
  const range = c.req.query("range") || "7d";
  const data = await getPages(projectId, range);
  return c.json(data);
});

app.get("/api/referrers", async (c) => {
  const projectId = extractProjectId(c);
  const range = c.req.query("range") || "7d";
  const data = await getReferrers(projectId, range);
  return c.json(data);
});

app.get("/api/countries", async (c) => {
  const projectId = extractProjectId(c);
  const range = c.req.query("range") || "7d";
  const data = await getCountries(projectId, range);
  return c.json(data);
});

app.get("/api/devices", async (c) => {
  const projectId = extractProjectId(c);
  const range = c.req.query("range") || "7d";
  const data = await getDevices(projectId, range);
  return c.json(data);
});

app.get("/api/events", async (c) => {
  const projectId = extractProjectId(c);
  const range = c.req.query("range") || "7d";
  const data = await getEvents(projectId, range);
  return c.json(data);
});

app.get("/api/usage", async (c) => {
  const userId = c.get("userId");
  const data = await getUsage(userId);
  return c.json(data);
});

app.post("/api/checkout", async (c) => {
  const userId = c.get("userId");
  const { tier } = await c.req.json();
  const session = await createCheckoutSession(userId, tier);
  return c.json({ url: session.url });
});

// Project management
app.get("/api/projects", async (c) => {
  const userId = c.get("userId");
  const projects = await getUserProjects(userId);
  return c.json(projects);
});

app.post("/api/projects", async (c) => {
  const userId = c.get("userId");
  const { name, domain } = await c.req.json();
  
  await initializeUserSchema();
  if (!name || !domain) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const project = await createProject(userId, name, domain);
  return c.json(project);
});

app.get("/api/projects/:id", async (c) => {
  const userId = c.get("userId");
  const projectId = c.req.param("id");
  
  const project = await getProjectById(projectId, userId);
  
  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json(project);
});

// Token management for CLI
app.post("/api/tokens", async (c) => {
  const userId = c.get("userId");
  const { name } = await c.req.json();
  
  const token = await createAPIToken(userId, name || "CLI Token");
  return c.json({ token });
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Initialize
const PORT = process.env.PORT || 3001;

console.log("🚀 Plots API starting...");

// Ensure database schema exists
try {
  await ensureSchema();
  console.log("✅ Database schema initialized");
} catch (error) {
  console.error("❌ Failed to initialize database:", error);
}

console.log(`🎯 Server running on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
