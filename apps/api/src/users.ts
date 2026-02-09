// User authentication and management
import { getPostgresClient } from "./db";
import { user, project, apiToken } from "./db-schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface User {
  id: string;
  email: string;
  name: string;
  email_verified?: boolean;
  image?: string;
  stripe_customer_id?: string;
  subscription_tier?: string;
  subscription_status?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

export interface APIToken {
  token: string;
  user_id: string;
  name: string;
  last_used: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// Generate random IDs
function generateId(prefix: string): string {
  return `${prefix}_${randomBytes(16).toString('base64url')}`;
}

// User functions

export async function getUserById(userId: string): Promise<User | null> {
  const { db } = getPostgresClient();
  
  const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  
  if (result.length === 0) return null;
  
  const u = result[0];
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    email_verified: u.emailVerified,
    image: u.image || undefined,
    created_at: u.createdAt.toISOString(),
    updated_at: u.updatedAt.toISOString(),
  };
}

// API Token functions

export async function createAPIToken(userId: string, name: string): Promise<string> {
  const { db } = getPostgresClient();
  
  const token = generateId("plots");
  const id = generateId("tok");
  
  await db.insert(apiToken).values({
    id,
    userId,
    token,
    name,
    createdAt: new Date(),
  });

  return token;
}

export async function validateAPIToken(token: string): Promise<string | null> {
  const { db } = getPostgresClient();
  
  const result = await db.select().from(apiToken).where(eq(apiToken.token, token)).limit(1);
  
  if (result.length === 0) return null;
  
  // Update last_used
  await db.update(apiToken)
    .set({ lastUsed: new Date() })
    .where(eq(apiToken.token, token));
  
  return result[0].userId;
}

// Project limits by tier
const PROJECT_LIMITS = {
  free: 1,
  pro: 10,
  business: 50,
};

export async function createProject(userId: string, name: string, domain: string): Promise<Project> {
  const { db } = getPostgresClient();
  
  // Check user's subscription tier and project count
  const u = await getUserById(userId);
  if (!u) {
    throw new Error('User not found');
  }
  
  const userProjects = await getUserProjects(userId);
  const tier = u.subscription_tier || 'free';
  const limit = PROJECT_LIMITS[tier as keyof typeof PROJECT_LIMITS] || PROJECT_LIMITS.free;
  
  if (userProjects.length >= limit) {
    throw new Error(`Project limit reached for ${tier} plan. Upgrade to add more projects.`);
  }
  
  const id = generateId("proj");
  const now = new Date();

  await db.insert(project).values({
    id,
    userId,
    name,
    domain,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    user_id: userId,
    name,
    domain,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { db } = getPostgresClient();
  
  const results = await db.select()
    .from(project)
    .where(eq(project.userId, userId))
    .orderBy(desc(project.createdAt));
  
  return results.map(p => ({
    id: p.id,
    user_id: p.userId,
    name: p.name,
    domain: p.domain,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }));
}

export async function getProjectById(projectId: string, userId: string): Promise<Project | null> {
  const { db } = getPostgresClient();
  
  const result = await db.select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const p = result[0];
  return {
    id: p.id,
    user_id: p.userId,
    name: p.name,
    domain: p.domain,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  };
}

export async function updateUserStripeInfo(
  userId: string, 
  stripeCustomerId: string, 
  subscriptionTier: string = 'free', 
  subscriptionStatus: string = 'active'
): Promise<void> {
  // Store Stripe info in user metadata - Better Auth handles the user table
  // For now, this is a placeholder. You might want to add these fields to the user schema
  console.log('Stripe info update - implement in Better Auth schema:', {
    userId,
    stripeCustomerId,
    subscriptionTier,
    subscriptionStatus
  });
}
