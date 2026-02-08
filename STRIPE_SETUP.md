# Stripe Setup Guide

Complete guide to set up Stripe billing for Plots analytics platform.

## 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (required for production)
3. Note: Use test mode during development

## 2. Create Products and Prices

### Via Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create **Starter Plan**:
   - Name: `Plots Starter`
   - Description: `10,000 events per month`
   - Pricing model: `Standard pricing`
   - Price: `$9.00 USD`
   - Billing period: `Monthly`
   - Click **Save product**
3. Copy the **Price ID** (starts with `price_...`)

### Via Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create product and price
stripe products create \
  --name "Plots Starter" \
  --description "10,000 events per month"

# Note the product ID (prod_...)

stripe prices create \
  --product prod_XXXXX \
  --unit-amount 900 \
  --currency usd \
  --recurring[interval]=month

# Copy the price ID (price_...)
```

## 3. Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy **Secret key** (starts with `sk_test_...` for test mode)
3. Copy **Publishable key** (starts with `pk_test_...`)

## 4. Setup Webhook

### Local Development (Stripe CLI):

```bash
# Forward webhooks to local server
stripe listen --forward-to http://localhost:3001/webhook/stripe

# Copy the webhook signing secret (starts with whsec_...)
```

### Production (Stripe Dashboard):

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://api.your-domain.com/webhook/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

## 5. Configure Environment Variables

Add to `/apps/api/.env`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx

# URLs
WEB_URL=http://localhost:3000
API_URL=http://localhost:3001
```

Add to `/apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 6. Update Database Schema

Run migration to add Stripe fields to users table:

```bash
cd apps/api

# The schema will auto-update on next server start
# Or manually run:
bun run src/index.ts
```

## 7. Test the Integration

### Test Checkout Flow:

1. Start the API server: `cd apps/api && bun run dev`
2. Start the web app: `cd apps/web && bun run dev`
3. Start Stripe webhook forwarding: `stripe listen --forward-to http://localhost:3001/webhook/stripe`
4. Go to `http://localhost:3000/pricing`
5. Click **Upgrade Now** on Starter plan
6. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. Complete checkout
8. Verify:
   - User redirected to dashboard
   - Settings page shows "Starter Plan"
   - Usage limit updated to 10,000 events
   - Stripe webhook received (check terminal with `stripe listen`)

### Test Webhook Events:

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription cancellation
stripe trigger customer.subscription.deleted
```

## 8. Usage-Based Event Counting

The system now counts **real events** from ClickHouse:

- **Free tier**: 1,000 events/month
- **Starter tier**: 10,000 events/month

Event counting query:
```sql
SELECT COUNT(*) as count
FROM events
WHERE project_id IN (
  SELECT id FROM projects WHERE user_id = {userId}
)
AND timestamp >= toStartOfMonth(now())
```

## 9. Webhook Event Flow

### New Subscription:
1. User upgrades on `/pricing`
2. Redirects to Stripe Checkout
3. User completes payment
4. Stripe sends `checkout.session.completed` webhook
5. API updates user:
   - `stripe_customer_id` = customer ID
   - `subscription_tier` = 'starter'
   - `subscription_status` = 'active'
6. Settings page shows new plan and limit

### Subscription Cancellation:
1. User cancels in Stripe Customer Portal
2. Stripe sends `customer.subscription.deleted` webhook
3. API updates user:
   - `subscription_tier` = 'free'
   - `subscription_status` = 'canceled'
4. Usage limit reverts to 1,000 events

### Payment Failed:
1. Stripe sends `invoice.payment_failed` webhook
2. API can handle grace period or downgrade

## 10. Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (remove `_test`)
- [ ] Configure production webhook endpoint
- [ ] Add Stripe Customer Portal for subscription management
- [ ] Implement payment retry logic
- [ ] Add email notifications for billing events
- [ ] Set up billing alerts for high usage
- [ ] Test subscription upgrades/downgrades
- [ ] Configure tax collection (if applicable)
- [ ] Add invoice customization (company logo, etc.)
- [ ] Implement proration for mid-cycle upgrades

## 11. Stripe Customer Portal (Optional)

Allow users to manage subscriptions:

```typescript
// Add to billing.ts
export async function createPortalSession(customerId: string) {
  const client = getStripeClient();
  
  const session = await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.WEB_URL}/settings`,
  });
  
  return session;
}

// Add endpoint to index.ts
app.post("/api/portal", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const user = await getUserById(userId);
  
  if (!user?.stripe_customer_id) {
    return c.json({ error: "No subscription" }, 400);
  }
  
  const session = await createPortalSession(user.stripe_customer_id);
  return c.json({ url: session.url });
});
```

## Troubleshooting

### Webhook not receiving events:
- Check Stripe CLI is running: `stripe listen --forward-to http://localhost:3001/webhook/stripe`
- Verify webhook secret matches `.env`
- Check API logs for errors
- Test with: `stripe trigger checkout.session.completed`

### Checkout session not creating:
- Verify `STRIPE_STARTER_PRICE_ID` is correct
- Check price is active in Stripe dashboard
- Ensure user is authenticated (cookies working)

### Usage not updating:
- Verify ClickHouse connection
- Check events are being ingested (`SELECT COUNT(*) FROM events`)
- Confirm user has projects with events
- Check date range: `toStartOfMonth(now())`

## Resources

- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
