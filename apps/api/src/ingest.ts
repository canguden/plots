// Event ingestion endpoint
import { Context } from "hono";
import { getClickHouseClient } from "./db";
import crypto from "crypto";

interface IngestPayload {
  project_id: string;
  event?: string;
  properties?: Record<string, any>;
  path?: string;
  referrer?: string;
  timestamp?: string;
}

// Extract device and browser from user agent (simple)
function parseUserAgent(ua: string) {
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "Mobile" : "Desktop";
  let browser = "Other";
  
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  
  return { device, browser };
}

// Get country from IP (simplified - in production use GeoIP)
function getCountryFromIP(ip: string): string {
  // Hash IP for privacy
  const hash = crypto.createHash("sha256").update(ip).digest("hex");
  // In production, use GeoIP lookup before hashing
  return "US"; // Placeholder
}

export async function ingestEvent(c: Context) {
  try {
    const payload: IngestPayload = await c.req.json();
    
    if (!payload.project_id) {
      return c.json({ error: "project_id is required" }, 400);
    }

    const userAgent = c.req.header("user-agent") || "";
    const { device, browser } = parseUserAgent(userAgent);
    
    // Get IP from various headers
    const ip = c.req.header("x-forwarded-for")?.split(",")[0] ||
               c.req.header("x-real-ip") ||
               "0.0.0.0";
    
    const country = getCountryFromIP(ip);
    
    const client = getClickHouseClient();
    
    await client.insert({
      table: "events",
      values: [{
        project_id: payload.project_id,
        ts: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        path: payload.path || "/",
        referrer: payload.referrer || "",
        country,
        device,
        browser,
        event: payload.event || "pageview",
      }],
      format: "JSONEachRow",
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Ingestion error:", error);
    return c.json({ error: "Failed to ingest event" }, 500);
  }
}
