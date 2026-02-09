// Stripe billing integration
import Stripe from "stripe";
import { getClickHouseClient } from "./db";
import { updateUserStripeInfo, getUserById } from "./users";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("Stripe API key not configured");
    }

    stripe = new Stripe(apiKey, {
      apiVersion: "2025-02-24.acacia",
    });
  }

  return stripe;
}

// Tier configuration
export const TIER_CONFIG: Record<string, { events: number; projects: number; retention: string }> = {
  free: { events: 1000, projects: 1, retention: "30 days" },
  starter: { events: 10000, projects: 3, retention: "90 days" },
  pro: { events: 100000, projects: 10, retention: "1 year" },
  business: { events: 1000000, projects: 999, retention: "Unlimited" },
};

// Map tier names to env var price IDs
const TIER_PRICE_ENV: Record<string, string> = {
  starter: "STRIPE_STARTER_PRICE_ID",
  pro: "STRIPE_PRO_PRICE_ID",
  business: "STRIPE_BUSINESS_PRICE_ID",
};

export async function getUsage(userId: string) {
  const client = getClickHouseClient();

  // Get the user to check their subscription tier
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Determine event limit based on subscription tier
  const tier = user.subscription_tier || 'free';
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const limit = config.events;

  // Get current month's event count for all user's projects
  const result = await client.query({
    query: `
      SELECT COUNT(*) as count
      FROM events
      WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = {userId:String}
      )
      AND timestamp >= toStartOfMonth(now())
    `,
    query_params: { userId },
  });

  const rows = await result.json();
  const current = rows.data.length > 0 ? (rows.data[0] as any).count : 0;
  const percentage = Math.round((current / limit) * 100);

  return {
    current,
    limit,
    percentage,
    tier,
  };
}

export async function createCheckoutSession(userId: string, tier: string) {
  const client = getStripeClient();

  // Validate tier
  const priceEnvKey = TIER_PRICE_ENV[tier];
  if (!priceEnvKey) {
    throw new Error(`Invalid tier: ${tier}. Must be one of: ${Object.keys(TIER_PRICE_ENV).join(', ')}`);
  }

  const priceId = process.env[priceEnvKey];
  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}. Set ${priceEnvKey} in environment.`);
  }

  // Get user
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Create or get Stripe customer
  let customerId = user.stripe_customer_id;

  if (!customerId) {
    const customer = await client.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    });

    customerId = customer.id;
    await updateUserStripeInfo(userId, customerId);
  }

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEB_URL}/pricing`,
    metadata: {
      userId,
      tier,
    },
  });

  return session;
}

export async function createPortalSession(userId: string) {
  const client = getStripeClient();

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.stripe_customer_id) {
    throw new Error("No active subscription found");
  }

  const session = await client.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.WEB_URL}/settings`,
  });

  return session;
}

// Helper to determine tier from Stripe price ID
function getTierFromPriceId(priceId: string): string {
  for (const [tier, envKey] of Object.entries(TIER_PRICE_ENV)) {
    if (process.env[envKey] === priceId) {
      return tier;
    }
  }
  return 'starter'; // fallback
}

export async function handleWebhook(body: string, signature: string) {
  const client = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not configured in environment");
    throw new Error("Stripe webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    event = await client.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier || 'starter';

      if (userId && session.customer) {
        await updateUserStripeInfo(
          userId,
          session.customer as string,
          tier,
          'active'
        );
        console.log(`✅ Subscription created for user ${userId}: ${tier}`);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`✅ Payment succeeded for ${invoice.customer}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Find user and mark as past_due
      const clickhouse = getClickHouseClient();
      const { db } = await import("./db").then(m => ({ db: m.getPostgresClient().db }));
      const { user: userTable } = await import("./db-schema");
      const { eq } = await import("drizzle-orm");

      const result = await db.select().from(userTable).where(eq(userTable.stripeCustomerId, customerId)).limit(1);

      if (result.length > 0) {
        const userId = result[0].id;
        await updateUserStripeInfo(
          userId,
          customerId,
          result[0].subscriptionTier || 'free',
          'past_due'
        );
        console.log(`⚠️ Payment failed for user ${userId}`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Determine the tier from the subscription's price
      const priceId = subscription.items.data[0]?.price?.id;
      const tier = priceId ? getTierFromPriceId(priceId) : 'starter';

      // Find user by Stripe customer ID
      const { db } = await import("./db").then(m => ({ db: m.getPostgresClient().db }));
      const { user: userTable } = await import("./db-schema");
      const { eq } = await import("drizzle-orm");

      const result = await db.select().from(userTable).where(eq(userTable.stripeCustomerId, customerId)).limit(1);

      if (result.length > 0) {
        const userId = result[0].id;
        const status = subscription.status;

        await updateUserStripeInfo(
          userId,
          customerId,
          tier,
          status
        );
        console.log(`✅ Subscription updated for user ${userId}: ${tier} (${status})`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find user and downgrade to free tier
      const { db } = await import("./db").then(m => ({ db: m.getPostgresClient().db }));
      const { user: userTable } = await import("./db-schema");
      const { eq } = await import("drizzle-orm");

      const result = await db.select().from(userTable).where(eq(userTable.stripeCustomerId, customerId)).limit(1);

      if (result.length > 0) {
        const userId = result[0].id;

        await updateUserStripeInfo(
          userId,
          customerId,
          'free',
          'canceled'
        );
        console.log(`✅ Subscription cancelled for user ${userId}`);
      }
      break;
    }

    default:
      console.log(`ℹ️  Unhandled webhook event type: ${event.type}`);
  }

  return { received: true };
}
