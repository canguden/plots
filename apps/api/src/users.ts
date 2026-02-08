// User authentication and management
import { getClickHouseClient } from "./db";

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
  return `${prefix}_${Math.random().toString(36).substr(2, 16)}`;
}

// User functions

export async function getUserById(userId: string): Promise<User | null> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: "SELECT * FROM users WHERE id = {userId:String}",
    query_params: { userId },
  });
  
  const rows = await result.json();
  return rows.data.length > 0 ? (rows.data[0] as User) : null;
}

// API Token functions

export async function createAPIToken(userId: string, name: string): Promise<string> {
  const client = getClickHouseClient();
  
  const token = generateId("pl_live");
  
  await client.insert({
    table: "api_tokens",
    values: [{
      token,
      user_id: userId,
      name,
      last_used: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }],
    format: "JSONEachRow",
  });

  return token;
}

export async function validateAPIToken(token: string): Promise<string | null> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: "SELECT user_id FROM api_tokens WHERE token = {token:String}",
    query_params: { token },
  });
  
  const rows = await result.json();
  
  if (rows.data.length > 0) {
    // Update last_used
    await client.command({
      query: `
        ALTER TABLE api_tokens 
        UPDATE last_used = now() 
        WHERE token = {token:String}
      `,
      query_params: { token },
    });
    
    return (rows.data[0] as any).user_id;
  }
  
  return null;
}

export async function createProject(userId: string, name: string, domain: string): Promise<Project> {
  const client = getClickHouseClient();
  
  const project: Project = {
    id: generateId("proj"),
    user_id: userId,
    name,
    domain,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await client.insert({
    table: "projects",
    values: [project],
    format: "JSONEachRow",
  });

  return project;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: "SELECT * FROM projects WHERE user_id = {userId:String} ORDER BY created_at DESC",
    query_params: { userId },
  });
  
  const rows = await result.json();
  return rows.data as Project[];
}

export async function getProjectById(projectId: string, userId: string): Promise<Project | null> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: `
      SELECT * FROM projects 
      WHERE id = {projectId:String} 
      AND user_id = {userId:String}
    `,
    query_params: { projectId, userId },
  });
  
  const rows = await result.json();
  return rows.data.length > 0 ? (rows.data[0] as Project) : null;
}

export async function updateUserStripeInfo(
  userId: string, 
  stripeCustomerId: string, 
  subscriptionTier: string = 'free', 
  subscriptionStatus: string = 'active'
): Promise<void> {
  const client = getClickHouseClient();
  
  await client.command({
    query: `
      ALTER TABLE users 
      UPDATE 
        stripe_customer_id = {stripeCustomerId:String},
        subscription_tier = {subscriptionTier:String},
        subscription_status = {subscriptionStatus:String},
        updated_at = now()
      WHERE id = {userId:String}
    `,
    query_params: { userId, stripeCustomerId, subscriptionTier, subscriptionStatus },
  });
}
