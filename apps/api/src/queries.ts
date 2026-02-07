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

function getDateRange(range: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  
  let start: Date;
  switch (range) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "yesterday":
      start = new Date(now.setDate(now.getDate() - 1));
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start = new Date(now.setDate(now.getDate() - 7));
      break;
    case "30d":
      start = new Date(now.setDate(now.getDate() - 30));
      break;
    default:
      start = new Date(now.setDate(now.getDate() - 7));
  }
  
  return { start: start.toISOString().split("T")[0], end };
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
        uniq(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as value
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
      bounceRate: 0.38, // Simplified for now
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
        uniq(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
        uniq(*) as uniqueVisitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= toDate({start: String})
        AND ts <= toDate({end: String})
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
