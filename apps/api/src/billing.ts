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

// Pro plan levels — "Plots grows with you"
// Each level is a separate Stripe Price on the same Product
export const PRO_LEVELS = [
  { events: 10_000, price: 10, label: "10K", envKey: "STRIPE_PRO_10K_PRICE_ID" },
  { events: 50_000, price: 20, label: "50K", envKey: "STRIPE_PRO_50K_PRICE_ID" },
  { events: 100_000, price: 30, label: "100K", envKey: "STRIPE_PRO_100K_PRICE_ID" },
  { events: 500_000, price: 50, label: "500K", envKey: "STRIPE_PRO_500K_PRICE_ID" },
  { events: 1_000_000, price: 80, label: "1M", envKey: "STRIPE_PRO_1M_PRICE_ID" },
];

// Get event limit for a user based on their tier
export function getEventLimit(tier: string): number {
  if (tier === 'free') return 1000;
  // tier format: "pro_10k", "pro_50k", etc.
  const level = PRO_LEVELS.find(l => `pro_${l.label.toLowerCase()}` === tier);
  if (level) return level.events;
  // Legacy tiers
  if (tier === 'starter') return 10000;
  if (tier === 'pro') return 100000;
  return 1000;
}

export async function getUsage(userId: string) {
  const client = getClickHouseClient();

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const tier = user.subscription_tier || 'free';
  const limit = getEventLimit(tier);

  // Get current month's event count
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

  // Find the matching level
  const level = PRO_LEVELS.find(l => `pro_${l.label.toLowerCase()}` === tier);
  if (!level) {
    throw new Error(`Invalid tier: ${tier}. Must be one of: ${PRO_LEVELS.map(l => `pro_${l.label.toLowerCase()}`).join(', ')}`);
  }

  const priceId = process.env[level.envKey];
  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}. Set ${level.envKey} in environment.`);
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
      metadata: { userId: user.id },
    });

    customerId = customer.id;
    await updateUserStripeInfo(userId, customerId);
  }

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEB_URL}/pricing`,
    metadata: { userId, tier },
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

// Determine tier from Stripe price ID
function getTierFromPriceId(priceId: string): string {
  for (const level of PRO_LEVELS) {
    if (process.env[level.envKey] === priceId) {
      return `pro_${level.label.toLowerCase()}`;
    }
  }
  return 'pro_10k'; // fallback
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
      const tier = session.metadata?.tier || 'pro_10k';

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

      const priceId = subscription.items.data[0]?.price?.id;
      const tier = priceId ? getTierFromPriceId(priceId) : 'pro_10k';

      const { db } = await import("./db").then(m => ({ db: m.getPostgresClient().db }));
      const { user: userTable } = await import("./db-schema");
      const { eq } = await import("drizzle-orm");

      const result = await db.select().from(userTable).where(eq(userTable.stripeCustomerId, customerId)).limit(1);

      if (result.length > 0) {
        const userId = result[0].id;
        await updateUserStripeInfo(userId, customerId, tier, subscription.status);
        console.log(`✅ Subscription updated for user ${userId}: ${tier} (${subscription.status})`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { db } = await import("./db").then(m => ({ db: m.getPostgresClient().db }));
      const { user: userTable } = await import("./db-schema");
      const { eq } = await import("drizzle-orm");

      const result = await db.select().from(userTable).where(eq(userTable.stripeCustomerId, customerId)).limit(1);

      if (result.length > 0) {
        const userId = result[0].id;
        await updateUserStripeInfo(userId, customerId, 'free', 'canceled');
        console.log(`✅ Subscription cancelled for user ${userId}`);
      }
      break;
    }

    default:
      console.log(`ℹ️  Unhandled webhook event type: ${event.type}`);
  }

  return { received: true };
}
