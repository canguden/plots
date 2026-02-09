-- Add projects and API tokens tables to PostgreSQL

CREATE TABLE IF NOT EXISTS project (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_user ON project("userId");

CREATE TABLE IF NOT EXISTS "apiToken" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    "lastUsed" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apitoken_user ON "apiToken"("userId");
CREATE INDEX IF NOT EXISTS idx_apitoken_token ON "apiToken"(token);
