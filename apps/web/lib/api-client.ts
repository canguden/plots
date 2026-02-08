// API client for browser/client components
import type {
  OverviewResponse,
  PagesResponse,
  ReferrersResponse,
  CountriesResponse,
  DevicesResponse,
  EventsResponse,
  UsageStats,
} from "@plots/ui";

// Client-side API calls go directly to API server with cookies
const API_BASE = typeof window !== "undefined" 
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
  : "http://localhost:3001";

async function fetcher<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include", // Include cookies for auth
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getOverview(range: string = "7d"): Promise<OverviewResponse> {
  return fetcher<OverviewResponse>(`/api/overview?range=${range}`);
}

export async function getPages(range: string = "7d"): Promise<PagesResponse> {
  return fetcher<PagesResponse>(`/pages?range=${range}`);
}

export async function getReferrers(range: string = "7d"): Promise<ReferrersResponse> {
  return fetcher<ReferrersResponse>(`/referrers?range=${range}`);
}

export async function getCountries(range: string = "7d"): Promise<CountriesResponse> {
  return fetcher<CountriesResponse>(`/countries?range=${range}`);
}

export async function getDevices(range: string = "7d"): Promise<DevicesResponse> {
  return fetcher<DevicesResponse>(`/devices?range=${range}`);
}

export async function getEvents(range: string = "7d"): Promise<EventsResponse> {
  return fetcher<EventsResponse>(`/events?range=${range}`);
}

export async function getUsage(): Promise<UsageStats> {
  return fetcher<UsageStats>("/usage");
}
