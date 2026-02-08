// better-auth configuration
import { betterAuth } from "better-auth";
import { createAdapterFactory } from "better-auth/adapters";
import { getClickHouseClient } from "../db";

// Proper ClickHouse adapter using createAdapterFactory
const clickhouseAdapter = () => {
  return createAdapterFactory({
    config: {
      adapterId: "clickhouse",
      adapterName: "ClickHouse Adapter",
      usePlural: false,
      debugLogs: false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
    },
    adapter: ({ getModelName }) => {
      const client = getClickHouseClient();
      
      return {
        async create({ model, data }) {
          const table = getModelName(model);
          
          await client.insert({
            table,
            values: [data],
            format: "JSONEachRow",
          });
          
          return data;
        },
        
        async findOne({ model, where }) {
          const table = getModelName(model);
          
          const conditions = where
            .map(({ field, value }, i) => `${field} = {val${i}}`)
            .join(" AND ");
          
          const params = where.reduce((acc, { value }, i) => {
            acc[`val${i}`] = value;
            return acc;
          }, {} as Record<string, any>);
          
          const result = await client.query({
            query: `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`,
            query_params: params,
          });
          
          const rows = await result.json();
          return rows.data[0] || null;
        },
        
        async findMany({ model, where, limit = 100 }) {
          const table = getModelName(model);
          
          if (!where || where.length === 0) {
            const result = await client.query({
              query: `SELECT * FROM ${table} LIMIT ${limit}`,
            });
            const rows = await result.json();
            return rows.data;
          }
          
          const conditions = where
            .map(({ field, value }, i) => `${field} = {val${i}}`)
            .join(" AND ");
          
          const params = where.reduce((acc, { value }, i) => {
            acc[`val${i}`] = value;
            return acc;
          }, {} as Record<string, any>);
          
          const result = await client.query({
            query: `SELECT * FROM ${table} WHERE ${conditions} LIMIT ${limit}`,
            query_params: params,
          });
          
          const rows = await result.json();
          return rows.data;
        },
        
        async update({ model, where, update }) {
          const table = getModelName(model);
          
          const whereConditions = where
            .map(({ field, value }, i) => `${field} = {where${i}}`)
            .join(" AND ");
          
          const updateSets = Object.entries(update)
            .map(([key, _], i) => `${key} = {set${i}}`)
            .join(", ");
          
          const params = {
            ...where.reduce((acc, { value }, i) => {
              acc[`where${i}`] = value;
              return acc;
            }, {} as Record<string, any>),
            ...Object.entries(update).reduce((acc, [_, val], i) => {
              acc[`set${i}`] = val;
              return acc;
            }, {} as Record<string, any>),
          };
          
          await client.command({
            query: `ALTER TABLE ${table} UPDATE ${updateSets} WHERE ${whereConditions}`,
            query_params: params,
          });
          
          // Return updated record
          const result = await client.query({
            query: `SELECT * FROM ${table} WHERE ${whereConditions} LIMIT 1`,
            query_params: where.reduce((acc, { value }, i) => {
              acc[`where${i}`] = value;
              return acc;
            }, {} as Record<string, any>),
          });
          const rows = await result.json();
          return rows.data[0] || null;
        },
        
        async updateMany({ model, where, update }) {
          const table = getModelName(model);
          
          const whereConditions = where
            .map(({ field, value }, i) => `${field} = {where${i}}`)
            .join(" AND ");
          
          const updateSets = Object.entries(update)
            .map(([key, _], i) => `${key} = {set${i}}`)
            .join(", ");
          
          const params = {
            ...where.reduce((acc, { value }, i) => {
              acc[`where${i}`] = value;
              return acc;
            }, {} as Record<string, any>),
            ...Object.entries(update).reduce((acc, [_, val], i) => {
              acc[`set${i}`] = val;
              return acc;
            }, {} as Record<string, any>),
          };
          
          await client.command({
            query: `ALTER TABLE ${table} UPDATE ${updateSets} WHERE ${whereConditions}`,
            query_params: params,
          });
          
          return 1; // ClickHouse doesn't return affected count easily
        },
        
        async delete({ model, where }) {
          const table = getModelName(model);
          
          const conditions = where
            .map(({ field, value }, i) => `${field} = {val${i}}`)
            .join(" AND ");
          
          const params = where.reduce((acc, { value }, i) => {
            acc[`val${i}`] = value;
            return acc;
          }, {} as Record<string, any>);
          
          await client.command({
            query: `DELETE FROM ${table} WHERE ${conditions}`,
            query_params: params,
          });
        },
        
        async deleteMany({ model, where }) {
          const table = getModelName(model);
          
          const conditions = where
            .map(({ field, value }, i) => `${field} = {val${i}}`)
            .join(" AND ");
          
          const params = where.reduce((acc, { value }, i) => {
            acc[`val${i}`] = value;
            return acc;
          }, {} as Record<string, any>);
          
          await  client.command({
            query: `DELETE FROM ${table} WHERE ${conditions}`,
            query_params: params,
          });
          
          return 1; // ClickHouse doesn't return affected count easily
        },
        
        async count({ model, where }) {
          const table = getModelName(model);
          
          if (!where || where.length === 0) {
            const result = await client.query({
              query: `SELECT count() as count FROM ${table}`,
            });
            const rows = await result.json();
            return Number(rows.data[0]?.count || 0);
          }
          
          const conditions = where
            .map(({ field, value }, i) => `${field} = {val${i}}`)
            .join(" AND ");
          
          const params = where.reduce((acc, { value }, i) => {
            acc[`val${i}`] = value;
            return acc;
          }, {} as Record<string, any>);
          
          const result = await client.query({
            query: `SELECT count() as count FROM ${table} WHERE ${conditions}`,
            query_params: params,
          });
          
          const rows = await result.json();
          return Number(rows.data[0]?.count || 0);
        },
      };
    },
  });
};

export const auth = betterAuth({
  database: clickhouseAdapter(),
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
  advanced: {
    disableCSRFCheck: process.env.NODE_ENV === "development",
  },
});

export type Auth = typeof auth;
