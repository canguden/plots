# 🚀 Plots Production Deployment Guide

This guide covers everything you need to deploy Plots to production.

## 📋 Pre-deployment Checklist

### 1. Environment Setup

Create production `.env` files for each service:

#### API (`apps/api/.env.production`)
```bash
# Database
CLICKHOUSE_HOST=your-clickhouse-host.com
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DATABASE=plots

# Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://api.plots.sh

# Stripe (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...

# CORS
WEB_URL=https://plots.sh

# Server
PORT=3001
NODE_ENV=production
```

#### Web (`apps/web/.env.production`)
```bash
# API URL (your deployed API)
NEXT_PUBLIC_API_URL=https://api.plots.sh
API_URL=https://api.plots.sh

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://plots.sh

# For server-side API calls
BEARER_TOKEN=pl_live_...
```

---

## 🗄️ Database Setup (ClickHouse)

### Option 1: ClickHouse Cloud (Recommended)
1. Sign up at https://clickhouse.com/cloud
2. Create a new service
3. Get connection details:
   - Host
   - User
   - Password
4. Update `.env.production` with connection details
5. Database schema will auto-initialize on first API start

### Option 2: Self-Hosted
```bash
# Docker Compose
docker run -d \
  --name clickhouse \
  -p 8123:8123 \
  -p 9000:9000 \
  -v clickhouse-data:/var/lib/clickhouse \
  clickhouse/clickhouse-server
```

---

## 💳 Stripe Setup (Live Mode)

### 1. Get Live API Keys
1. Go to https://dashboard.stripe.com
2. Toggle to **Live mode** (top right)
3. Navigate to **Developers > API keys**
4. Copy:
   - **Secret key** (`sk_live_...`)
   - **Publishable key** (`pk_live_...`)

### 2. Create Products & Prices
```bash
# Pro Plan ($19/month)
stripe products create \
  --name "Pro" \
  --description "Up to 100k events/month"

stripe prices create \
  --product prod_xxx \
  --unit-amount 1900 \
  --currency usd \
  --recurring interval=month

# Business Plan ($49/month)
stripe products create \
  --name "Business" \
  --description "Up to 1M events/month"

stripe prices create \
  --product prod_yyy \
  --unit-amount 4900 \
  --currency usd \
  --recurring interval=month
```

### 3. Setup Webhooks
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. URL: `https://api.plots.sh/webhook/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing secret** (`whsec_...`)
6. Add to `STRIPE_WEBHOOK_SECRET` in API `.env.production`

---

## 🌐 Web App Deployment (Vercel)

### Deploy to Vercel
```bash
cd apps/web

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or connect to GitHub for auto-deploys
vercel link
vercel --prod
```

### Vercel Environment Variables
Add these in Vercel Dashboard (Settings > Environment Variables):

```bash
NEXT_PUBLIC_API_URL=https://api.plots.sh x
API_URL=https://api.plots.sh x
BETTER_AUTH_SECRET=[same-as-api] x
BETTER_AUTH_URL=https://plots.sh x
BEARER_TOKEN=[get-from-api] ?
```

### Custom Domain
1. Add domain in Vercel: `plots.sh`
2. Update DNS:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

---

## 🖥️ API Deployment

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add ClickHouse (if using Railway)
railway add

# Deploy
cd apps/api
railway up
```

### Option 2: Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
cd apps/api
fly launch --name plots-api

# Set secrets
fly secrets set \
  CLICKHOUSE_HOST=... \
  CLICKHOUSE_PASSWORD=... \
  STRIPE_SECRET_KEY=... \
  STRIPE_WEBHOOK_SECRET=... \
  BETTER_AUTH_SECRET=...

# Deploy
fly deploy
```

### Option 3: Docker + VPS
```dockerfile
# apps/api/Dockerfile
FROM oven/bun:1.1 AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app ./

EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
```

```bash
# Build & deploy
docker build -t plots-api .
docker run -d -p 3001:3001 --env-file .env.production plots-api
```

---

## 📦 CLI Deployment (npm)

### 1. Update package.json
```json
{
  "name": "@plots/cli",
  "version": "1.0.0",
  "description": "Terminal analytics dashboard for Plots",
  "bin": {
    "plots": "./dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### 2. Build CLI
```bash
cd apps/cli

# Build TypeScript
bun build src/index.tsx --outdir dist --target bun

# Make executable
chmod +x dist/index.js

# Add shebang to dist/index.js
echo '#!/usr/bin/env bun' | cat - dist/index.js > temp && mv temp dist/index.js
```

### 3. Publish to npm
```bash
# Login to npm
npm login

# Publish
npm publish

# Or publish with scope
npm publish --access public
```

### 4. Test Installation
```bash
# Global install
npm install -g @plots/cli

# Or with bun
bun install -g @plots/cli

# Test
plots --version
plots login
plots
```

---

## 🔐 Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] `BETTER_AUTH_SECRET` is 32+ random characters
- [ ] Stripe is in live mode with webhook signature verification
- [ ] CORS is configured (`WEB_URL` in API)
- [ ] HTTPS enabled on all domains
- [ ] ClickHouse uses secure password
- [ ] Rate limiting enabled (TODO: add middleware)
- [ ] API tokens are properly validated

---

## 📊 Monitoring & Logs

### API Logs
```bash
# Railway
railway logs

# Fly.io
fly logs

# Docker
docker logs plots-api -f
```

### Error Tracking
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Prometheus** for metrics

---

## 🧪 Testing Production

### 1. Test API
```bash
curl https://api.plots.sh/health
# Should return: {"status":"ok"}

# Test ingest
curl -X POST https://api.plots.sh/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_xxx",
    "event": "pageview",
    "path": "/test",
    "referrer": "",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
  }'
```

### 2. Test Web App
```bash
# Visit homepage
open https://plots.sh

# Test signup flow
# 1. Go to /signup
# 2. Create account
# 3. Complete onboarding
# 4. See dashboard

# Test tracking script
open https://plots.sh/plots.js
```

### 3. Test CLI
```bash
# Install from npm
npm install -g @plots/cli

# Login
plots login

# View dashboard
plots

# Init tracking
plots init
```

### 4. Test Stripe
1. Go to dashboard
2. Click upgrade
3. Use test card: `4242 4242 4242 4242`
4. Check webhook logs in Stripe dashboard

---

## 🚨 Common Issues

### Issue: CORS errors in browser
**Fix:** Ensure `WEB_URL` in API `.env` matches your web domain

### Issue: Stripe webhook failing
**Fix:** 
1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Ensure API is using `constructEventAsync`

### Issue: CLI can't connect
**Fix:** Update `API_URL` in CLI environment or add flag:
```bash
plots login --api https://api.plots.sh
```

### Issue: Database connection failed
**Fix:** 
1. Verify ClickHouse credentials
2. Check firewall allows connection
3. Ensure database exists (auto-created on first start)

---

## 📈 Scaling Considerations

### When to scale:

**< 100k events/month**
- Single API server
- ClickHouse Cloud starter tier
- Free Vercel deployment

**100k - 1M events/month**
- 2-3 API servers behind load balancer
- ClickHouse Cloud production tier
- Vercel Pro

**1M+ events/month**
- Auto-scaling API servers
- ClickHouse cluster
- CDN for tracking script
- Redis for rate limiting

---

## 🎯 Post-Deployment Tasks

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure backup strategy for ClickHouse
- [ ] Set up alerts for error rates
- [ ] Test all user flows end-to-end
- [ ] Monitor Stripe webhook deliveries
- [ ] Document any custom configurations
- [ ] Set up staging environment

---

## 📞 Support

- **Documentation:** https://plots.sh/docs
- **GitHub Issues:** https://github.com/canguden/plots/issues
- **Email:** support@plots.sh

---

## ✅ Final Deployment Checklist

### Pre-Deploy
- [ ] All `.env.production` files created
- [ ] Stripe live keys obtained
- [ ] ClickHouse database provisioned
- [ ] Domain DNS configured
- [ ] SSL certificates ready

### Deploy
- [ ] API deployed and accessible
- [ ] Web app deployed on Vercel
- [ ] CLI published to npm
- [ ] Tracking script accessible at `/plots.js`

### Post-Deploy
- [ ] Test signup → onboarding → dashboard flow
- [ ] Test tracking script on live site
- [ ] Test CLI installation and login
- [ ] Test Stripe checkout and webhooks
- [ ] Verify analytics data flowing
- [ ] Monitor error logs for issues

### Going Live
- [ ] Announce on social media
- [ ] Update github.com/canguden/plots README
- [ ] Submit to ProductHunt
- [ ] Share with beta users
- [ ] Monitor first 24 hours closely

---

**🎉 You're ready for production!**

Remember to monitor logs closely in the first few days and have a rollback plan ready.
