# Plots Authentication & Security Model

## Overview
Plots now has a complete authentication system with proper data isolation, security, and privacy controls.

## Architecture

### 1. User Management
- **Users Table**: Stores user accounts (id, email, password_hash, name)
- **Password Security**: Passwords are hashed (will use bcrypt in production)
- **Signup Flow**: Creates user + default project + session
- **Login Flow**: Validates credentials + creates session

### 2. Authentication Methods

#### Web Users (Cookie-based Sessions)
- **Session Storage**: ClickHouse sessions table
- **Cookie**: `plots_session` (HttpOnly, Secure, SameSite=Strict)
- **Duration**: 30 days
- **Logout**: Deletes session + clears cookie

#### CLI Users (API Tokens)
- **Token Format**: `pl_live_*` or `pl_test_*` prefixes
- **Storage**: ClickHouse api_tokens table
- **Local Storage**: `~/.config/plots/config.json`
- **Usage Tracking**: last_used timestamp updated on each request

### 3. Project Management
- **Projects Table**: Stores website projects (id, user_id, name, domain)
- **Multi-Project**: Users can have multiple projects
- **Data Isolation**: Queries filter by user's projects only
- **Default Project**: Created automatically on signup

### 4. Authorization Middleware
```typescript
// Checks both methods:
1. API Token (Bearer header) → validates against api_tokens table
2. Session Cookie → validates against sessions table
3. Sets userId in context for downstream queries
```

### 5. Data Security

#### Row-Level Security
- All analytics queries filter by `projectId`
- Projects are linked to `user_id`
- Users can only access their own projects
- No cross-user data leakage

#### What's Tracked vs What's Private
**We Track (for analytics):**
- Page URLs
- Referrers
- Country (will use GeoIP)
- Device/Browser/OS
- Timestamps

**We DON'T Track:**
- User identities (cookieless tracking)
- Personal information
- IP addresses (only used for GeoIP lookup, then discarded)
- Cross-site behavior
- Any PII

#### Privacy-First Principles
1. **No cookies for tracking**: We don't set cookies on tracked websites
2. **No personal data**: Events are anonymous
3. **GDPR compliant**: By default
4. **Data ownership**: Users own their analytics data
5. **Open source**: Transparent code

## API Endpoints

### Public (No Auth Required)
```
POST /ingest                 - Track analytics events
POST /auth/signup           - Create account
POST /auth/login            - Login
POST /auth/logout           - Logout
POST /webhook/stripe        - Stripe webhooks
```

### Protected (Requires Auth)
```
GET  /api/overview          - Get analytics overview
GET  /api/pages             - Get page stats
GET  /api/referrers         - Get referrer stats
GET  /api/countries         - Get country stats
GET  /api/devices           - Get device stats
GET  /api/events            - Get raw events
GET  /api/usage             - Get billing usage
POST /api/checkout          - Create Stripe checkout
GET  /api/projects          - List user's projects
POST /api/projects          - Create new project
GET  /api/projects/:id      - Get project details
POST /api/tokens            - Generate API token for CLI
```

## Database Schema

### Core Tables
```sql
-- Users
CREATE TABLE users (
  id String,
  email String,
  password_hash String,
  name String,
  created_at DateTime,
  updated_at DateTime
)

-- Projects
CREATE TABLE projects (
  id String,
  user_id String,
  name String,
  domain String,
  created_at DateTime,
  updated_at DateTime
)

-- Sessions (Web)
CREATE TABLE sessions (
  session_id String,
  user_id String,
  expires_at DateTime,
  created_at DateTime
)

-- API Tokens (CLI)
CREATE TABLE api_tokens (
  token String,
  user_id String,
  name String,
  last_used DateTime,
  created_at DateTime
)

-- Events (Analytics)
CREATE TABLE events (
  project_id String,
  visitor_id String,
  session_id String,
  url String,
  referrer String,
  country String,
  device String,
  browser String,
  os String,
  timestamp DateTime
)
```

## Security Features

### ✅ Implemented
- [x] User registration & login
- [x] Password hashing
- [x] Session management (30-day expiry)
- [x] API token authentication
- [x] Project-level data isolation
- [x] HttpOnly secure cookies
- [x] Row-level security in queries
- [x] CORS protection
- [x] Token validation

### 🔜 Production Todos
- [ ] Use bcrypt/argon2 for password hashing
- [ ] Add rate limiting (login attempts, API calls)
- [ ] Add 2FA support
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Add CSRF tokens for web forms
- [ ] Add API rate limits per tier
- [ ] Add audit logs
- [ ] Add IP-based blocking
- [ ] Add webhook signature verification

## User Flows

### Web User Journey
1. Visit `/signup` → Enter email/password/name
2. Backend creates user + project + session
3. Returns cookie → Redirect to dashboard
4. All API calls use session cookie
5. `/logout` → Clear session

### CLI User Journey
1. Web: Login → Navigate to Settings → Generate API token
2. CLI: `plots login` → Paste token
3. Token stored in `~/.config/plots/config.json`
4. All CLI commands send token as Bearer header
5. `plots logout` → Delete local token

## Why This Matters

### Before (Broken)
- ❌ No user accounts
- ❌ Everyone sees same data
- ❌ No data isolation
- ❌ No security
- ❌ Can't use in production

### After (Fixed)
- ✅ Proper user accounts
- ✅ Each user sees only their data
- ✅ Project-level isolation
- ✅ Secure authentication
- ✅ Ready for real users

## Testing

### Create Test Account
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Projects (with session)
```bash
curl http://localhost:3001/api/projects \
  -H "Cookie: plots_session=sess_xxxxx"
```

### Generate CLI Token
```bash
curl -X POST http://localhost:3001/api/tokens \
  -H "Cookie: plots_session=sess_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"name": "My CLI Token"}'
```

### Use API Token
```bash
curl http://localhost:3001/api/overview \
  -H "Authorization: Bearer pl_live_xxxxx"
```

## Next Steps

1. **Deploy**: Get this to production
2. **Test**: Real users testing auth flows
3. **Security Audit**: Have someone review the implementation
4. **Add bcrypt**: Replace simple password hashing
5. **Add Email**: Verification + password reset
6. **Add Billing**: Connect to Stripe for tiered access
7. **Add Rate Limiting**: Prevent abuse
8. **Add Monitoring**: Track auth failures, suspicious activity
