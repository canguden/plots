// ClickHouse client and query utilities
import { createClient, ClickHouseClient } from "@clickhouse/client";

let clickhouse: ClickHouseClient | null = null;

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
        event LowCardinality(String)
      )
      ENGINE = MergeTree
      PARTITION BY toYYYYMM(ts)
      ORDER BY (project_id, ts)
    `,
  });
}
