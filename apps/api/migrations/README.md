# Database Migration

After deploying, run this SQL script on your PostgreSQL database to add the projects and API tokens tables:

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL -f apps/api/migrations/001_add_projects_tokens.sql
```

Or run it directly from the Railway/Vercel console:

1. Go to your Railway database
2. Open the "Query" tab
3. Copy and paste the contents of `apps/api/migrations/001_add_projects_tokens.sql`
4. Run the query

This adds:
- `project` table (user projects/websites)
- `apiToken` table (API authentication tokens)

These tables are stored in PostgreSQL alongside Better Auth's user tables, while analytics events remain in ClickHouse.
