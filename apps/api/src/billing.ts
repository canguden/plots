// Stripe billing integration
import Stripe from "stripe";

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
  // In production, query ClickHouse for user's event count
  return {
    current: 450,
    limit: 1000,
    percentage: 45,
  };
}

export async function createCheckoutSession(userId: string, tier: "starter") {
  const client = getStripeClient();
  
  const session = await client.checkout.sessions.create({
    mode: "subscription",
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
    case "checkout.session.completed":
      // Handle successful subscription
      console.log("Subscription created:", event.data.object);
      break;
    case "invoice.payment_succeeded":
      // Handle successful payment
      console.log("Payment succeeded:", event.data.object);
      break;
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      console.log("Subscription cancelled:", event.data.object);
      break;
  }

  return { received: true };
}
