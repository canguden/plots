// better-auth configuration
import { betterAuth } from "better-auth";
import { getClickHouseClient } from "../db";

// Custom adapter for ClickHouse
const clickhouseAdapter = {
  async createUser(user: any) {
    const client = getClickHouseClient();
    const id = `user_${Math.random().toString(36).substr(2, 16)}`;
    
    await client.insert({
      table: "users",
      values: [{
        id,
        email: user.email,
        name: user.name || "",
        email_verified: false,
        image: user.image || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }],
      format: "JSONEachRow",
    });
    
    return { ...user, id, emailVerified: false };
  },

  async getUserByEmail(email: string) {
    const client = getClickHouseClient();
    const result = await client.query({
      query: "SELECT * FROM users WHERE email = {email:String} LIMIT 1",
      query_params: { email },
    });
    const rows = await result.json();
    if (rows.data.length === 0) return null;
    
    const user = rows.data[0] as any;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.email_verified,
      image: user.image,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  },

  async getUserById(id: string) {
    const client = getClickHouseClient();
    const result = await client.query({
      query: "SELECT * FROM users WHERE id = {id:String} LIMIT 1",
      query_params: { id },
    });
    const rows = await result.json();
    if (rows.data.length === 0) return null;
    
    const user = rows.data[0] as any;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.email_verified,
      image: user.image,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  },

  async createSession(session: any) {
    const client = getClickHouseClient();
    const id = `session_${Math.random().toString(36).substr(2, 16)}`;
    
    await client.insert({
      table: "sessions",
      values: [{
        id,
        user_id: session.userId,
        expires_at: session.expiresAt.toISOString(),
        session_token: session.token,
        created_at: new Date().toISOString(),
      }],
      format: "JSONEachRow",
    });
    
    return { ...session, id };
  },

  async getSession(token: string) {
    const client = getClickHouseClient();
    const result = await client.query({
      query: `
        SELECT * FROM sessions 
        WHERE session_token = {token:String} 
        AND expires_at > now() 
        LIMIT 1
      `,
      query_params: { token },
    });
    const rows = await result.json();
    if (rows.data.length === 0) return null;
    
    const session = rows.data[0] as any;
    return {
      id: session.id,
      userId: session.user_id,
      expiresAt: new Date(session.expires_at),
      token: session.session_token,
    };
  },

  async updateSession(token: string, data: any) {
    const client = getClickHouseClient();
    await client.command({
      query: `
        ALTER TABLE sessions 
        UPDATE expires_at = {expiresAt:String}
        WHERE session_token = {token:String}
      `,
      query_params: {
        token,
        expiresAt: data.expiresAt.toISOString(),
      },
    });
  },

  async deleteSession(token: string) {
    const client = getClickHouseClient();
    await client.command({
      query: "DELETE FROM sessions WHERE session_token = {token:String}",
      query_params: { token },
    });
  },

  async createAccount(account: any) {
    const client = getClickHouseClient();
    const id = `account_${Math.random().toString(36).substr(2, 16)}`;
    
    await client.insert({
      table: "accounts",
      values: [{
        id,
        user_id: account.userId,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        access_token: account.accessToken || "",
        refresh_token: account.refreshToken || "",
        expires_at: account.expiresAt ? new Date(account.expiresAt).toISOString() : null,
        token_type: account.tokenType || "",
        scope: account.scope || "",
        id_token: account.idToken || "",
        password_hash: account.password || "",
        created_at: new Date().toISOString(),
      }],
      format: "JSONEachRow",
    });
    
    return { ...account, id };
  },

  async getAccount(provider: string, providerAccountId: string) {
    const client = getClickHouseClient();
    const result = await client.query({
      query: `
        SELECT * FROM accounts 
        WHERE provider = {provider:String} 
        AND provider_account_id = {providerAccountId:String}
        LIMIT 1
      `,
      query_params: { provider, providerAccountId },
    });
    const rows = await result.json();
    if (rows.data.length === 0) return null;
    
    const account = rows.data[0] as any;
    return {
      id: account.id,
      userId: account.user_id,
      provider: account.provider,
      providerAccountId: account.provider_account_id,
      password: account.password_hash,
    };
  },

  async updateUser(id: string, data: any) {
    const client = getClickHouseClient();
    const updates: string[] = [];
    const params: Record<string, any> = { id };
    
    if (data.email) {
      updates.push("email = {email:String}");
      params.email = data.email;
    }
    if (data.name) {
      updates.push("name = {name:String}");
      params.name = data.name;
    }
    if (data.emailVerified !== undefined) {
      updates.push("email_verified = {emailVerified:Bool}");
      params.emailVerified = data.emailVerified;
    }
    if (data.image) {
      updates.push("image = {image:String}");
      params.image = data.image;
    }
    
    updates.push("updated_at = now()");
    
    if (updates.length > 0) {
      await client.command({
        query: `
          ALTER TABLE users 
          UPDATE ${updates.join(", ")}
          WHERE id = {id:String}
        `,
        query_params: params,
      });
    }
    
    return this.getUserById(id);
  },

  async deleteUser(id: string) {
    const client = getClickHouseClient();
    await client.command({
      query: "DELETE FROM users WHERE id = {id:String}",
      query_params: { id },
    });
  },
};

export const auth = betterAuth({
  database: clickhouseAdapter as any,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.WEB_URL || "http://localhost:3000",
  ],
  secret: process.env.AUTH_SECRET || "this-is-a-secret-value-with-at-least-32-characters-for-development",
  baseURL: process.env.API_URL || "http://localhost:3001",
});

export type Auth = typeof auth;
