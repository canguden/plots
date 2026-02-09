// Analytics queries for dashboard data
import { getClickHouseClient } from "./db";
import type {
  OverviewResponse,
  PagesResponse,
  ReferrersResponse,
  CountriesResponse,
  DevicesResponse,
  EventsResponse,
} from "@plots/ui";

function formatDateForClickHouse(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getDateRange(range: string): { start: string; end: string } {
  const now = new Date();
  const end = formatDateForClickHouse(now);

  let start: Date;
  switch (range) {
    case "today":
      start = new Date();
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      start = yesterday;
      break;
    case "7d":
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      start = sevenDaysAgo;
      break;
    case "30d":
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      start = thirtyDaysAgo;
      break;
    default:
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 7);
      defaultStart.setHours(0, 0, 0, 0);
      start = defaultStart;
  }

  return { start: formatDateForClickHouse(start), end };
}

export async function getOverview(
  projectId: string,
  range: string = "7d"
): Promise<OverviewResponse> {
  const client = getClickHouseClient();
  const { start, end } = getDateRange(range);

  // Get stats
  const statsResult = await client.query({
    query: `
      SELECT
        count(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const stats = (await statsResult.json()) as Array<{ visitors: number; pageviews: number }>;
  const firstRow = stats[0] || { visitors: 0, pageviews: 0 };
  const { visitors = 0, pageviews = 0 } = firstRow;

  // Get time series
  const seriesResult = await client.query({
    query: `
      SELECT
        toDate(ts) as date,
        count(*) as value
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY date
      ORDER BY date
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const series = await seriesResult.json();

  // Get top pages
  const pagesResult = await client.query({
    query: `
      SELECT
        path,
        count(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY path
      ORDER BY visitors DESC
      LIMIT 5
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const topPages = await pagesResult.json();

  return {
    stats: {
      visitors,
      pageviews,
      bounceRate: 0, // Real bounce rate calculation would go here
      avgDuration: 0,
    },
    series: series.map((s: any) => ({
      date: s.date,
      value: s.value,
    })),
    topPages: topPages.map((p: any) => ({
      path: p.path,
      visitors: p.visitors,
      pageviews: p.pageviews,
      bounceRate: 0,
    })),
  };
}

export async function getPages(
  projectId: string,
  range: string = "7d"
): Promise<PagesResponse> {
  const client = getClickHouseClient();
  const { start, end } = getDateRange(range);

  const result = await client.query({
    query: `
      SELECT
        path,
        count(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY path
      ORDER BY visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const pages = await result.json();

  return {
    pages: pages.map((p: any) => ({
      path: p.path,
      visitors: p.visitors,
      pageviews: p.pageviews,
      bounceRate: 0,
    })),
    total: pages.length,
  };
}

export async function getReferrers(
  projectId: string,
  range: string = "7d"
): Promise<ReferrersResponse> {
  const client = getClickHouseClient();
  const { start, end } = getDateRange(range);

  const result = await client.query({
    query: `
      SELECT
        referrer as domain,
        count(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
        AND referrer != ''
      GROUP BY domain
      ORDER BY visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const referrers = await result.json();

  return {
    referrers: referrers.map((r: any) => ({
      domain: r.domain,
      visitors: r.visitors,
      pageviews: r.pageviews,
    })),
    total: referrers.length,
  };
}

export async function getCountries(
  projectId: string,
  range: string = "7d"
): Promise<CountriesResponse> {
  const client = getClickHouseClient();
  const { start, end } = getDateRange(range);

  const result = await client.query({
    query: `
      SELECT
        country,
        count(*) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY country
      ORDER BY visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const countries = await result.json();
  const total = countries.reduce((sum: number, c: any) => sum + c.visitors, 0);

  return {
    countries: countries.map((c: any) => ({
      country: c.country,
      countryCode: c.country,
      visitors: c.visitors,
      percentage: (c.visitors / total) * 100,
    })),
    total: countries.length,
  };
}

export async function getDevices(
  projectId: string,
  range: string = "7d"
): Promise<DevicesResponse> {
  const client = getClickHouseClient();
  const { start, end } = getDateRange(range);

  const devicesResult = await client.query({
    query: `
      SELECT
        device,
        count(*) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY device
      ORDER BY visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const browsersResult = await client.query({
    query: `
      SELECT
        browser,
        count(*) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY browser
      ORDER BY visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const devices = await devicesResult.json();
  const browsers = await browsersResult.json();

  const totalDevices = devices.reduce((sum: number, d: any) => sum + d.visitors, 0);
  const totalBrowsers = browsers.reduce((sum: number, b: any) => sum + b.visitors, 0);

  return {
    devices: devices.map((d: any) => ({
      device: d.device,
      visitors: d.visitors,
      percentage: (d.visitors / totalDevices) * 100,
    })),
    browsers: browsers.map((b: any) => ({
      browser: b.browser,
      visitors: b.visitors,
      percentage: (b.visitors / totalBrowsers) * 100,
    })),
  };
}

export async function getEvents(
  projectId: string,
  range: string = "7d"
): Promise<EventsResponse> {
  const client = getClickHouseClient();
  const { start, end } = getDateRange(range);

  const result = await client.query({
    query: `
      SELECT
        event as name,
        count(*) as count,
        count(*) as uniqueVisitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
        AND event != 'pageview'
      GROUP BY name
      ORDER BY count DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const events = await result.json();

  return {
    events: events.map((e: any) => ({
      name: e.name,
      count: e.count,
      uniqueVisitors: e.uniqueVisitors,
    })),
    total: events.length,
  };
}
