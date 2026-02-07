// Shared configuration and constants

export const API_URL = process.env.API_URL || "https://plots.sh/api";

export const TIME_RANGES = {
  today: { label: "Today", days: 0 },
  yesterday: { label: "Yesterday", days: 1 },
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
} as const;

export const USAGE_TIERS = {
  free: { name: "Free", limit: 1000, price: 0 },
  starter: { name: "Starter", limit: 10000, price: 9 },
} as const;

export const OVERAGE_PRICE_PER_10K = 5;

export const CONFIG_PATH = "~/.config/plots/config.json";

export const TOKEN_PREFIX = "pl_live_";
