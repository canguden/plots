// API client for fetching analytics data
import type {
  OverviewResponse,
  PagesResponse,
  ReferrersResponse,
  CountriesResponse,
  DevicesResponse,
  EventsResponse,
  UsageStats,
} from "@plots/ui";
import { API_URL, TOKEN_PREFIX } from "@plots/config";

const API_BASE = process.env.API_URL || API_URL;
const AUTH_TOKEN = process.env.BEARER_TOKEN || `${TOKEN_PREFIX}dev_token`;

async function fetcher<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return await response.json() as T;
}

export async function getOverview(range: string = "7d"): Promise<OverviewResponse> {
  return fetcher<OverviewResponse>(`/api/overview?range=${range}`);
}

export async function getPages(range: string = "7d"): Promise<PagesResponse> {
  return fetcher<PagesResponse>(`/api/pages?range=${range}`);
}

export async function getReferrers(range: string = "7d"): Promise<ReferrersResponse> {
  return fetcher<ReferrersResponse>(`/api/referrers?range=${range}`);
}

export async function getCountries(range: string = "7d"): Promise<CountriesResponse> {
  return fetcher<CountriesResponse>(`/api/countries?range=${range}`);
}

export async function getDevices(range: string = "7d"): Promise<DevicesResponse> {
  return fetcher<DevicesResponse>(`/api/devices?range=${range}`);
}

export async function getEvents(range: string = "7d"): Promise<EventsResponse> {
  return fetcher<EventsResponse>(`/api/events?range=${range}`);
}

export async function getUsage(): Promise<UsageStats> {
  return fetcher<UsageStats>("/api/usage");
}
