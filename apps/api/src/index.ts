// Hono backend - main entry point
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware, extractProjectId } from "./auth";
import { ingestEvent } from "./ingest";
import { ensureSchema } from "./db";
import {
  getOverview,
  getPages,
  getReferrers,
  getCountries,
  getDevices,
  getEvents,
} from "./queries";
import { getUsage, createCheckoutSession, handleWebhook } from "./billing";

// Define Hono context types
type Variables = {
  userId: string;
  projectId: string;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Public endpoints
app.post("/ingest", ingestEvent);

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
