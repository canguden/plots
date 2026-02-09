// Database schema for users and projects
import { getClickHouseClient } from "./db";

export async function initializeUserSchema() {
  const client = getClickHouseClient();

  // Users table (better-auth compatible)
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS users (
        id String,
        email String,
        name String,
        email_verified Bool DEFAULT false,
        image String DEFAULT '',
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

  // Sessions table (better-auth compatible)
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS sessions (
        id String,
        user_id String,
        session_token String,
        expires_at DateTime,
        created_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree()
      ORDER BY (id, session_token)
    `,
  });

  // Accounts table (better-auth compatible - for password storage and OAuth)
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS accounts (
        id String,
        user_id String,
        provider String,
        provider_account_id String,
        password_hash String DEFAULT '',
        access_token String DEFAULT '',
        refresh_token String DEFAULT '',
        expires_at Nullable(DateTime),
        token_type String DEFAULT '',
        scope String DEFAULT '',
        id_token String DEFAULT '',
        created_at DateTime DEFAULT now()
      )
      ENGINE = MergeTree()
      ORDER BY (user_id, provider, provider_account_id)
    `,
  });

  console.log("✅ User schema initialized");
}
