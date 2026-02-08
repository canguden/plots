// User authentication and management
import { getClickHouseClient } from "./db";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
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
  session_id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

// Generate random IDs
function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 16)}`;
}

// Hash password (simple for now - use bcrypt in production)
function hashPassword(password: string): string {
  // In production, use bcrypt or argon2
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString('base64') === hash;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const client = getClickHouseClient();
  
  // Check if user exists
  const existing = await client.query({
    query: "SELECT * FROM users WHERE email = {email:String}",
    query_params: { email },
  });
  
  const rows = await existing.json();
  if (rows.data.length > 0) {
    throw new Error("User already exists");
  }

  const user: User = {
    id: generateId("user"),
    email,
    password_hash: hashPassword(password),
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await client.insert({
    table: "users",
    values: [user],
    format: "JSONEachRow",
  });

  return user;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: "SELECT * FROM users WHERE email = {email:String}",
    query_params: { email },
  });
  
  const rows = await result.json();
  if (rows.data.length === 0) {
    return null;
  }

  const user = rows.data[0] as User;
  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  return user;
}

export async function getUserById(userId: string): Promise<User | null> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: "SELECT * FROM users WHERE id = {userId:String}",
    query_params: { userId },
  });
  
  const rows = await result.json();
  return rows.data.length > 0 ? (rows.data[0] as User) : null;
}

export async function createSession(userId: string): Promise<string> {
  const client = getClickHouseClient();
  
  const sessionId = generateId("sess");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await client.insert({
    table: "sessions",
    values: [{
      session_id: sessionId,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    }],
    format: "JSONEachRow",
  });

  return sessionId;
}

export async function validateSession(sessionId: string): Promise<string | null> {
  const client = getClickHouseClient();
  
  const result = await client.query({
    query: `
      SELECT user_id FROM sessions 
      WHERE session_id = {sessionId:String} 
      AND expires_at > now()
    `,
    query_params: { sessionId },
  });
  
  const rows = await result.json();
  return rows.data.length > 0 ? (rows.data[0] as any).user_id : null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const client = getClickHouseClient();
  
  await client.command({
    query: "DELETE FROM sessions WHERE session_id = {sessionId:String}",
    query_params: { sessionId },
  });
}

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
