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

export async function getUsage(userId: string) {
  const client = getClickHouseClient();
  
  // Get the user to check their subscription tier
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  // Determine event limit based on subscription tier
  const limits: Record<string, number> = {
    free: 1000,
    starter: 10000,
    pro: 100000,
  };
  
  const limit = limits[user.subscription_tier || 'free'] || 1000;
  
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
  };
}

export async function createCheckoutSession(userId: string, tier: "starter") {
  const client = getStripeClient();
  
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
        price: process.env.STRIPE_STARTER_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.WEB_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEB_URL}/pricing`,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function handleWebhook(body: string, signature: string) {
  const client = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  const event = client.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (userId && session.customer) {
        // Update user with Stripe customer ID
        await updateUserStripeInfo(
          userId, 
          session.customer as string, 
          'starter',
          'active'
        );
        console.log(`✅ Subscription created for user ${userId}`);
      }
      break;
    }
    
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`✅ Payment succeeded for ${invoice.customer}`);
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Find user by Stripe customer ID
      const clickhouse = getClickHouseClient();
      const result = await clickhouse.query({
        query: "SELECT id FROM users WHERE stripe_customer_id = {customerId:String}",
        query_params: { customerId },
      });
      
      const rows = await result.json();
      if (rows.data.length > 0) {
        const userId = (rows.data[0] as any).id;
        const status = subscription.status;
        
        await updateUserStripeInfo(
          userId,
          customerId,
          'starter',
          status
        );
        console.log(`✅ Subscription updated for user ${userId}: ${status}`);
      }
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Find user and downgrade to free tier
      const clickhouse = getClickHouseClient();
      const result = await clickhouse.query({
        query: "SELECT id FROM users WHERE stripe_customer_id = {customerId:String}",
        query_params: { customerId },
      });
      
      const rows = await result.json();
      if (rows.data.length > 0) {
        const userId = (rows.data[0] as any).id;
        
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
  }

  return { received: true };
}
