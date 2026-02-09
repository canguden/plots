// better-auth configuration
import { betterAuth } from "better-auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db-schema";

// PostgreSQL connection for user management
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://plots.sh",
    "https://www.plots.sh",
    ...(process.env.WEB_URL ? [process.env.WEB_URL] : []),
  ],
  secret: process.env.AUTH_SECRET || "this-is-a-secret-value-with-at-least-32-characters-for-development",
  baseURL: process.env.API_URL || "http://localhost:3001",
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});

export type Auth = typeof auth;
