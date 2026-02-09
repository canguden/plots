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

export async function getOverview(range: string = "7d", projectId?: string): Promise<OverviewResponse> {
  const query = projectId ? `?range=${range}&project=${projectId}` : `?range=${range}`;
  return fetcher<OverviewResponse>(`/api/overview${query}`);
}

export async function getPages(range: string = "7d", projectId?: string): Promise<PagesResponse> {
  const query = projectId ? `?range=${range}&project=${projectId}` : `?range=${range}`;
  return fetcher<PagesResponse>(`/api/pages${query}`);
}

export async function getReferrers(range: string = "7d", projectId?: string): Promise<ReferrersResponse> {
  const query = projectId ? `?range=${range}&project=${projectId}` : `?range=${range}`;
  return fetcher<ReferrersResponse>(`/api/referrers${query}`);
}

export async function getCountries(range: string = "7d", projectId?: string): Promise<CountriesResponse> {
  const query = projectId ? `?range=${range}&project=${projectId}` : `?range=${range}`;
  return fetcher<CountriesResponse>(`/api/countries${query}`);
}

export async function getDevices(range: string = "7d", projectId?: string): Promise<DevicesResponse> {
  const query = projectId ? `?range=${range}&project=${projectId}` : `?range=${range}`;
  return fetcher<DevicesResponse>(`/api/devices${query}`);
}


export async function getEvents(range: string = "7d", projectId?: string): Promise<EventsResponse> {
  const query = projectId ? `?range=${range}&project=${projectId}` : `?range=${range}`;
  return fetcher<EventsResponse>(`/api/events${query}`);
}

export async function getUsage(): Promise<UsageStats> {
  return fetcher<UsageStats>("/usage");
}
