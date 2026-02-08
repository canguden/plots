// Database schema for users and projects
import { getClickHouseClient } from "./db";

export async function initializeUserSchema() {
  const client = getClickHouseClient();

  // Users table
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS users (
        id String,
        email String,
        password_hash String,
        name String,
        stripe_customer_id String DEFAULT '',
        subscription_tier String DEFAULT 'free',
        subscription_status String DEFAULT 'active',
        created_at DateTime DEFAULT now(),
        updated_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree()
      ORDER BY (id)
    `,
  });

  // Projects table
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS projects (
        id String,
        user_id String,
        name String,
        domain String,
        created_at DateTime DEFAULT now(),
        updated_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree()
      ORDER BY (user_id, id)
    `,
  });

  // API tokens table
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS api_tokens (
        token String,
        user_id String,
        name String,
        last_used DateTime,
        created_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree()
      ORDER BY (user_id, token)
    `,
  });

  // Sessions table for web
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS sessions (
        session_id String,
        user_id String,
        expires_at DateTime,
        created_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree()
      ORDER BY (session_id)
    `,
  });

  console.log("✅ User schema initialized");
}
