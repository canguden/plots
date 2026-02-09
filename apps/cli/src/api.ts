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
import { API_URL } from "@plots/config";
import { getToken } from "./auth";

const API_BASE = process.env.API_URL || API_URL;

async function fetcher<T>(endpoint: string): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("Not logged in. Run 'plots login' first.");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Run 'plots login' again.");
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  return await response.json() as T;
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
  return fetcher<UsageStats>("/api/usage");
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  userId: string;
  createdAt: string;
}

export async function getProjects(): Promise<Project[]> {
  return fetcher<Project[]>("/api/projects");
}
