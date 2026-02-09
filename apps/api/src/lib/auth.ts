// better-auth configuration
import { betterAuth } from "better-auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db-schema";

// PostgreSQL connection for user management
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const baseURL = process.env.API_URL || (process.env.NODE_ENV === "production" ? "https://api.plots.sh" : "http://localhost:3001");
console.log(`[BetterAuth] Initializing with baseURL: ${baseURL}`);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
    cookieCache: {
      enabled: false, // Disable cache for better cross-subdomain reliability
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://plots.sh",
    "https://www.plots.sh",
    ...(process.env.WEB_URL ? [process.env.WEB_URL] : []),
  ],
  secret: process.env.AUTH_SECRET || "this-is-a-secret-value-with-at-least-32-characters-for-development",
  baseURL,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieOptions: {
      domain: process.env.NODE_ENV === "production" ? ".plots.sh" : undefined,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },
});

export type Auth = typeof auth;
