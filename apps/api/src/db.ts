// ClickHouse client and query utilities
import { createClient, ClickHouseClient } from "@clickhouse/client";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db-schema";

let clickhouse: ClickHouseClient | null = null;
let pgClient: ReturnType<typeof postgres> | null = null;
let pgDb: ReturnType<typeof drizzle> | null = null;

export function getClickHouseClient(): ClickHouseClient {
  if (!clickhouse) {
    const url = process.env.CLICKHOUSE_HOST;
    const password = process.env.CLICKHOUSE_PASSWORD;

    if (!url || !password) {
      throw new Error("ClickHouse credentials not configured");
    }

    clickhouse = createClient({
      url,
      password,
    });
  }

  return clickhouse;
}

export function getPostgresClient() {
  if (!pgClient) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("PostgreSQL DATABASE_URL not configured");
    }
    pgClient = postgres(url);
    pgDb = drizzle(pgClient, { schema });
  }
  return { client: pgClient, db: pgDb! };
}

export async function ensureSchema() {
  const client = getClickHouseClient();

  await client.exec({
    query: `
      CREATE TABLE IF NOT EXISTS events (
        project_id String,
        ts DateTime,
        path String,
        referrer String,
        country LowCardinality(String),
        device LowCardinality(String),
        browser LowCardinality(String),
        os LowCardinality(String) DEFAULT '',
        event LowCardinality(String),
        session_id String,
        visitor_id String DEFAULT ''
      )
      ENGINE = MergeTree
      PARTITION BY toYYYYMM(ts)
      ORDER BY (project_id, ts, session_id)
    `,
  });

  // Add ClickHouse columns if table already exists without them
  try {
    await client.exec({
      query: `ALTER TABLE events ADD COLUMN IF NOT EXISTS os LowCardinality(String) DEFAULT ''`,
    });
    await client.exec({
      query: `ALTER TABLE events ADD COLUMN IF NOT EXISTS visitor_id String DEFAULT ''`,
    });
  } catch (e) {
    // Columns might already exist, ignore
  }

  // Add Stripe billing columns to Postgres user table
  const { client: pg } = getPostgresClient();
  try {
    await pg`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT`;
    await pg`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT DEFAULT 'free'`;
    await pg`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'inactive'`;
  } catch (e) {
    // Columns might already exist, ignore
  }
}
