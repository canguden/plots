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

  // 1. ClickHouse Schema (using command for DDL)
  console.log("🛠️ Ensuring ClickHouse schema...");
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS events (
        project_id String,
        ts DateTime,
        path String,
        referrer String,
        country LowCardinality(String),
        device LowCardinality(String),
        browser LowCardinality(String),
        event LowCardinality(String),
        session_id String,
        visitor_id String
      )
      ENGINE = MergeTree
      PARTITION BY toYYYYMM(ts)
      ORDER BY (project_id, ts, visitor_id, session_id)
    `,
  });

  // 2. Individual column migrations (failsafe)
  const columns = ["session_id", "visitor_id"];
  for (const col of columns) {
    try {
      console.log(`🛠️ Migrating ClickHouse column: ${col}...`);
      await client.command({
        query: `ALTER TABLE events ADD COLUMN IF NOT EXISTS ${col} String`,
      });
    } catch (e) {
      console.warn(`⚠️ Migration info for ${col}:`, e instanceof Error ? e.message : e);
    }
  }

  // 3. PostgreSQL Schema (Better Auth)
  try {
    console.log("🛠️ Ensuring PostgreSQL schema...");
    const { initializeUserSchema } = await import("./schema");
    await initializeUserSchema();
  } catch (error) {
    console.error("❌ PostgreSQL schema error:", error);
  }
}
