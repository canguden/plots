// Shared types for API responses and view models
// Used by TUI, Web, and API to guarantee parity

export interface TimeRange {
  start: Date;
  end: Date;
  label: "today" | "yesterday" | "7d" | "30d";
}

export interface OverviewStats {
  visitors: number;
  pageviews: number;
  bounceRate: number;
  avgDuration: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface TopPage {
  path: string;
  visitors: number;
  pageviews: number;
  bounceRate: number;
}

export interface TopReferrer {
  domain: string;
  visitors: number;
  pageviews: number;
}

export interface TopCountry {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
}

export interface TopDevice {
  device: string;
  visitors: number;
  percentage: number;
}

export interface TopBrowser {
  browser: string;
  visitors: number;
  percentage: number;
}

export interface CustomEvent {
  name: string;
  count: number;
  uniqueVisitors: number;
}

export interface OverviewResponse {
  stats: OverviewStats;
  series: DataPoint[];
  topPages: TopPage[];
}

export interface PagesResponse {
  pages: TopPage[];
  total: number;
}

export interface ReferrersResponse {
  referrers: TopReferrer[];
  total: number;
}

export interface CountriesResponse {
  countries: TopCountry[];
  total: number;
}

export interface DevicesResponse {
  devices: TopDevice[];
  browsers: TopBrowser[];
}

export interface EventsResponse {
  events: CustomEvent[];
  total: number;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
}

export interface UsageStats {
  current: number;
  limit: number;
  percentage: number;
}
