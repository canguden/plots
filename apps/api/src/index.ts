// Hono backend - main entry point
// Log immediately to confirm container startup
console.log("⏳ API module loading...");
console.log("📦 Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  hasDbUrl: !!process.env.DATABASE_URL,
  hasClickhouse: !!process.env.CLICKHOUSE_HOST,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  apiUrl: process.env.API_URL || "(not set)",
});

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
import { cliAuth } from "./cli-auth";

// Define Hono context types
type Variables = {
  userId: string;
  projectId: string;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware
app.use("*", logger());
app.use("*", cors({
  origin: (origin) => {
    const allowed = [
      "http://localhost:3000",
      "https://plots.sh",
      "https://www.plots.sh",
    ];
    // Allow all Vercel preview URLs
    if (origin?.includes("vercel.app")) return origin;
    // Allow configured WEB_URL
    if (process.env.WEB_URL && origin === process.env.WEB_URL) return origin;
    // Allow if in allowed list
    return allowed.includes(origin || "") ? origin : allowed[0];
  },
  credentials: true,
}));

// Health check
app.get("/", (c) => {
  return c.json({
    service: "Plots Analytics API",
    status: "healthy",
    version: "1.0.0",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Public endpoints
app.post("/ingest", ingestEvent);

// CLI OAuth device flow
app.route("/cli", cliAuth);

// Serve tracking script
app.get("/plots.js", async (c) => {
  const scriptContent = `// Plots Analytics - Client Script
// Privacy-first, lightweight analytics

(function() {
  'use strict';
  
  const script = document.currentScript;
  const projectId = script?.getAttribute('data-project');
  const apiUrl = script?.getAttribute('data-api') || '${process.env.API_URL || 'https://api.plots.sh'}';
  
  if (!projectId) {
    console.warn('[Plots] No project ID provided');
    return;
  }

  // Session handling (tab-scoped)
  function getSessionId() {
    let sid = sessionStorage.getItem('plots_sid');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('plots_sid', sid);
    }
    return sid;
  }

  // Send event
  function send(event, data = {}) {
    const payload = {
      project_id: projectId,
      event,
      path: location.pathname,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      ...data
    };

    const endpoint = \`\${apiUrl}/ingest\`;
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(payload));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Track pageview
  function pageview() {
    send('pageview');
  }

  // Track custom event
  function track(name, props) {
    send(name, { properties: props });
  }

  // Initial pageview
  pageview();

  // SPA navigation support
  let lastPath = location.pathname;
  
  ['pushState', 'replaceState'].forEach(method => {
    const original = history[method];
    history[method] = function() {
      original.apply(this, arguments);
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        pageview();
      }
    };
  });

  window.addEventListener('popstate', () => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      pageview();
    }
  });

  // Expose global API
  window.plots = { track };
})();`;

  return c.body(scriptContent, 200, {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'public, max-age=3600',
  });
});

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

  // Don't create default project - user will do this in onboarding

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
  console.log("🔔 Webhook request received");
  console.log("📝 STRIPE_WEBHOOK_SECRET configured:", !!process.env.STRIPE_WEBHOOK_SECRET);

  const body = await c.req.text();
  const signature = c.req.header("stripe-signature");

  if (!signature) {
    console.error("❌ No signature header found");
    return c.json({ error: "No signature" }, 400);
  }

  try {
    const result = await handleWebhook(body, signature);
    return c.json(result);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return c.json({ error: "Webhook failed" }, 400);
  }
});

// Protected endpoints
app.use("/api/*", authMiddleware);

app.get("/api/overview", async (c) => {
  const userId = c.get("userId");
  const projectId = extractProjectId(c);

  // Verify user owns this project
  const { verifyProjectOwnership } = await import("./auth");
  const hasAccess = await verifyProjectOwnership(userId, projectId);
  if (!hasAccess) {
    return c.json({ error: "Access denied" }, 403);
  }

  const range = c.req.query("range") || "7d";
  const data = await getOverview(projectId, range);
  return c.json(data);
});

app.get("/api/pages", async (c) => {
  const userId = c.get("userId");
  const projectId = extractProjectId(c);

  const { verifyProjectOwnership } = await import("./auth");
  if (!await verifyProjectOwnership(userId, projectId)) {
    return c.json({ error: "Access denied" }, 403);
  }

  const range = c.req.query("range") || "7d";
  const data = await getPages(projectId, range);
  return c.json(data);
});

app.get("/api/referrers", async (c) => {
  const userId = c.get("userId");
  const projectId = extractProjectId(c);

  const { verifyProjectOwnership } = await import("./auth");
  if (!await verifyProjectOwnership(userId, projectId)) {
    return c.json({ error: "Access denied" }, 403);
  }

  const range = c.req.query("range") || "7d";
  const data = await getReferrers(projectId, range);
  return c.json(data);
});

app.get("/api/countries", async (c) => {
  const userId = c.get("userId");
  const projectId = extractProjectId(c);

  const { verifyProjectOwnership } = await import("./auth");
  if (!await verifyProjectOwnership(userId, projectId)) {
    return c.json({ error: "Access denied" }, 403);
  }

  const range = c.req.query("range") || "7d";
  const data = await getCountries(projectId, range);
  return c.json(data);
});

app.get("/api/devices", async (c) => {
  const userId = c.get("userId");
  const projectId = extractProjectId(c);

  const { verifyProjectOwnership } = await import("./auth");
  if (!await verifyProjectOwnership(userId, projectId)) {
    return c.json({ error: "Access denied" }, 403);
  }

  const range = c.req.query("range") || "7d";
  const data = await getDevices(projectId, range);
  return c.json(data);
});

app.get("/api/events", async (c) => {
  const userId = c.get("userId");
  const projectId = extractProjectId(c);

  const { verifyProjectOwnership } = await import("./auth");
  if (!await verifyProjectOwnership(userId, projectId)) {
    return c.json({ error: "Access denied" }, 403);
  }

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

// Initialize and block server start until DB is ready
console.log("🚀 Plots API starting...");
try {
  await ensureSchema();
  console.log("✅ Database and schema ready");
} catch (error) {
  console.error("❌ CRITICAL: Database initialization failed:", error);
  // We still start the server but it might fail requests - better for debugging than a silent crash
}

const server = Bun.serve({
  port: PORT,
  fetch: app.fetch,
});

console.log(`🎯 Server running on http://localhost:${server.port}`);

export default server;
