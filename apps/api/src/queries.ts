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
      start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setHours(0, 0, 0, 0);
      return {
        start: formatDateForClickHouse(start),
        end: formatDateForClickHouse(yesterdayEnd)
      };
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
    case "year":
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setHours(0, 0, 0, 0);
      start = oneYearAgo;
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

  // Get base stats - session metrics
  const statsResult = await client.query({
    query: `
      SELECT
        count(DISTINCT session_id) as sessions,
        count(*) as pageviews,
        AVG(duration) as avgDuration,
        (countIf(session_events = 1) / count(DISTINCT session_id)) * 100 as bounceRate
      FROM (
        SELECT 
          session_id,
          count(*) as session_events,
          dateDiff('second', MIN(ts), MAX(ts)) as duration
        FROM events
        WHERE project_id = {projectId: String}
          AND ts >= {start: DateTime}
          AND ts <= {end: DateTime}
        GROUP BY session_id
      )
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  // Get unique visitors count
  const visitorsResult = await client.query({
    query: `
      SELECT
        count(DISTINCT if(visitor_id != '', visitor_id, session_id)) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const stats = (await statsResult.json()) as any[];
  const visitorsStats = (await visitorsResult.json()) as any[];
  const firstRow = stats[0] || { sessions: 0, pageviews: 0, avgDuration: 0, bounceRate: 0 };
  const visitorsRow = visitorsStats[0] || { visitors: 0 };

  const visitors = Number(visitorsRow.visitors || 0);
  const sessions = Number(firstRow.sessions || 0);
  const pageviews = Number(firstRow.pageviews || 0);
  const avgDuration = Math.round(Number(firstRow.avgDuration || 0));
  const bounceRate = Math.round(Number(firstRow.bounceRate || 0));

  // Determine granularity and generate zero-filled time series
  const isHourly = range === "today" || range === "yesterday";
  const isMonthly = range === "year";
  const groupFunc = isHourly
    ? "toStartOfHour(ts)"
    : isMonthly
      ? "toStartOfMonth(ts)"
      : "toDate(ts)";

  // Get time series from ClickHouse
  const seriesResult = await client.query({
    query: `
      SELECT
        ${groupFunc} as date,
        count(DISTINCT session_id) as value
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

  const rawSeries = await seriesResult.json();

  // Build a lookup map from actual data
  const dataMap = new Map<string, number>();
  for (const point of rawSeries as any[]) {
    const key = String(point.date);
    dataMap.set(key, Number(point.value));
  }

  // Generate all expected time buckets and zero-fill
  const allBuckets: { date: string; value: number }[] = [];
  const startDate = new Date(start.replace(' ', 'T') + 'Z');
  const endDate = new Date(end.replace(' ', 'T') + 'Z');

  if (isHourly) {
    // Generate all hours in the range
    const cursor = new Date(startDate);
    cursor.setMinutes(0, 0, 0);
    while (cursor <= endDate) {
      const isoKey = cursor.toISOString().replace('T', ' ').substring(0, 19);
      const val = dataMap.get(isoKey) || 0;
      // Also try matching without seconds
      let matched = val;
      if (!matched) {
        for (const [k, v] of dataMap) {
          if (k.startsWith(isoKey.substring(0, 13))) {
            matched = v;
            break;
          }
        }
      }
      allBuckets.push({ date: cursor.toISOString(), value: matched });
      cursor.setHours(cursor.getHours() + 1);
    }
  } else if (isMonthly) {
    // Generate all months in the range
    const cursor = new Date(startDate);
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= endDate) {
      const dateStr = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-01`;
      let matched = 0;
      for (const [k, v] of dataMap) {
        if (k.startsWith(dateStr)) {
          matched = v;
          break;
        }
      }
      allBuckets.push({ date: cursor.toISOString(), value: matched });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    // Generate all days in the range
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= endDate) {
      const dateStr = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(cursor.getUTCDate()).padStart(2, '0')}`;
      let matched = 0;
      for (const [k, v] of dataMap) {
        if (k.startsWith(dateStr)) {
          matched = v;
          break;
        }
      }
      allBuckets.push({ date: cursor.toISOString(), value: matched });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Get top pages
  const pagesResult = await client.query({
    query: `
      SELECT
        path,
        count(DISTINCT session_id) as visitors,
        count(*) as pageviews,
        (countIf(session_events = 1) / count(DISTINCT session_id)) * 100 as bounceRate
      FROM (
        SELECT 
          path,
          session_id,
          count(*) as session_events
        FROM events
        WHERE project_id = {projectId: String}
          AND ts >= {start: DateTime}
          AND ts <= {end: DateTime}
        GROUP BY path, session_id
      )
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
      sessions,
      pageviews,
      bounceRate,
      avgDuration,
    },
    series: allBuckets.map((s: any) => ({
      date: s.date,
      value: Number(s.value),
    })),
    topPages: topPages.map((p: any) => ({
      path: p.path,
      visitors: Number(p.visitors),
      pageviews: Number(p.pageviews),
      bounceRate: Math.round(Number(p.bounceRate || 0)),
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
        count(DISTINCT session_id) as visitors,
        count(*) as pageviews,
        (countIf(session_events = 1) / count(DISTINCT session_id)) * 100 as bounceRate
      FROM (
        SELECT 
          path,
          session_id,
          count(*) as session_events
        FROM events
        WHERE project_id = {projectId: String}
          AND ts >= {start: DateTime}
          AND ts <= {end: DateTime}
        GROUP BY path, session_id
      )
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
      visitors: Number(p.visitors),
      pageviews: Number(p.pageviews),
      bounceRate: Math.round(Number(p.bounceRate || 0)),
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
        if(referrer = '', 'Direct', referrer) as domain,
        count(DISTINCT session_id) as visitors,
        count(*) as pageviews
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
      GROUP BY domain
      ORDER BY (domain = 'Direct') DESC, visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const referrers = await result.json();

  return {
    referrers: referrers.map((r: any) => ({
      domain: r.domain,
      visitors: Number(r.visitors),
      pageviews: Number(r.pageviews),
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
        count(DISTINCT session_id) as visitors
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
  const total = countries.reduce((sum: number, c: any) => sum + Number(c.visitors), 0);

  return {
    countries: countries.map((c: any) => ({
      country: c.country,
      countryCode: c.country,
      visitors: Number(c.visitors),
      percentage: total > 0 ? (Number(c.visitors) / total) * 100 : 0,
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
        count(DISTINCT session_id) as visitors
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
        count(DISTINCT session_id) as visitors
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

  const osResult = await client.query({
    query: `
      SELECT
        os,
        count(DISTINCT session_id) as visitors
      FROM events
      WHERE project_id = {projectId: String}
        AND ts >= {start: DateTime}
        AND ts <= {end: DateTime}
        AND os != ''
      GROUP BY os
      ORDER BY visitors DESC
    `,
    query_params: { projectId, start, end },
    format: "JSONEachRow",
  });

  const devices = await devicesResult.json();
  const browsers = await browsersResult.json();
  const osData = await osResult.json();

  const totalDevices = devices.reduce((sum: number, d: any) => sum + Number(d.visitors), 0);
  const totalBrowsers = browsers.reduce((sum: number, b: any) => sum + Number(b.visitors), 0);
  const totalOS = osData.reduce((sum: number, o: any) => sum + Number(o.visitors), 0);

  return {
    devices: devices.map((d: any) => ({
      device: d.device,
      visitors: Number(d.visitors),
      percentage: totalDevices > 0 ? (Number(d.visitors) / totalDevices) * 100 : 0,
    })),
    browsers: browsers.map((b: any) => ({
      browser: b.browser,
      visitors: Number(b.visitors),
      percentage: totalBrowsers > 0 ? (Number(b.visitors) / totalBrowsers) * 100 : 0,
    })),
    os: osData.map((o: any) => ({
      os: o.os,
      visitors: Number(o.visitors),
      percentage: totalOS > 0 ? (Number(o.visitors) / totalOS) * 100 : 0,
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
