// CLI OAuth Device Flow endpoints
import { Hono } from "hono";
import { getClickHouseClient } from "./db";
import crypto from "crypto";

interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_at: Date;
  user_id?: string;
  token?: string;
}

const deviceCodes = new Map<string, DeviceCode>();

export const cliAuth = new Hono();

// Step 1: CLI requests device code
cliAuth.post("/device/code", async (c) => {
  const deviceCode = crypto.randomBytes(32).toString("hex");
  const userCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const code: DeviceCode = {
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: `${process.env.WEB_URL || "http://localhost:3000"}/cli-auth?user_code=${userCode}`,
    expires_at: expiresAt,
  };

  deviceCodes.set(deviceCode, code);
  deviceCodes.set(userCode, code);

  // Clean up after expiration
  setTimeout(() => {
    deviceCodes.delete(deviceCode);
    deviceCodes.delete(userCode);
  }, 15 * 60 * 1000);

  return c.json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: code.verification_uri,
    expires_in: 900, // 15 minutes in seconds
    interval: 5, // Poll every 5 seconds
  });
});

// Step 2: CLI polls for authorization
cliAuth.post("/device/token", async (c) => {
  const { device_code } = await c.req.json();

  const code = deviceCodes.get(device_code);

  if (!code) {
    return c.json({ error: "expired_token" }, 400);
  }

  if (code.expires_at < new Date()) {
    deviceCodes.delete(device_code);
    deviceCodes.delete(code.user_code);
    return c.json({ error: "expired_token" }, 400);
  }

  if (!code.token) {
    return c.json({ error: "authorization_pending" }, 400);
  }

  // Token granted! Clean up and return
  deviceCodes.delete(device_code);
  deviceCodes.delete(code.user_code);

  return c.json({
    access_token: code.token,
    token_type: "bearer",
  });
});

// Step 3: Web browser authorizes device (called from web app after user logs in)
cliAuth.post("/device/authorize", async (c) => {
  const { user_code } = await c.req.json();

  // Get user from session
  const cookie = c.req.header("Cookie");
  if (!cookie) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const { auth } = await import("./lib/auth");
  let userId: string;
  
  try {
    const session = await auth.api.getSession({ headers: { cookie } });
    if (!session?.user) {
      return c.json({ error: "unauthorized" }, 401);
    }
    userId = session.user.id;
  } catch (error) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const code = deviceCodes.get(user_code);

  if (!code) {
    return c.json({ error: "invalid_code" }, 400);
  }

  if (code.expires_at < new Date()) {
    deviceCodes.delete(code.device_code);
    deviceCodes.delete(user_code);
    return c.json({ error: "expired_token" }, 400);
  }

  // Generate API token for this user
  const { createAPIToken } = await import("./users");
  const token = await createAPIToken(userId, "CLI Device");

  // Store token in device code
  code.token = token;
  code.user_id = userId;

  return c.json({ success: true });
});

export { deviceCodes };
