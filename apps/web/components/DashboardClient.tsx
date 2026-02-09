"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  OverviewResponse,
  PagesResponse,
  ReferrersResponse,
  CountriesResponse,
  DevicesResponse,
} from "@plots/ui";
import { getOverview, getPages, getReferrers, getCountries, getDevices } from "../lib/api-client";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { AnalyticsChart } from "./AnalyticsChart";

interface Project {
  id: string;
  name: string;
  domain: string;
}

interface Props {
  initialData: {
    overview: OverviewResponse;
    pages: PagesResponse;
    referrers: ReferrersResponse;
    countries: CountriesResponse;
    devices: DevicesResponse;
  };
  initialRange: string;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

export function DashboardClient({ initialData, initialRange }: Props) {
  const [range, setRange] = useState(initialRange);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [overview, setOverview] = useState(initialData.overview);
  const [pages, setPages] = useState(initialData.pages);
  const [referrers, setReferrers] = useState(initialData.referrers);
  const [countries, setCountries] = useState(initialData.countries);
  const [devices, setDevices] = useState(initialData.devices);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.plots.sh';
        const response = await fetch(`${apiUrl}/api/projects`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          if (data.length > 0 && !selectedProject) {
            setSelectedProject(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch all data
  const fetchData = useCallback(async (newRange?: string) => {
    const targetRange = newRange || range;
    setIsRefreshing(true);

    try {
      const [overviewData, pagesData, referrersData, countriesData, devicesData] = await Promise.all([
        getOverview(targetRange, selectedProject || undefined),
        getPages(targetRange, selectedProject || undefined),
        getReferrers(targetRange, selectedProject || undefined),
        getCountries(targetRange, selectedProject || undefined),
        getDevices(targetRange, selectedProject || undefined),
      ]);

      setOverview(overviewData);
      setPages(pagesData);
      setReferrers(referrersData);
      setCountries(countriesData);
      setDevices(devicesData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [range, selectedProject]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Refetch when range changes
  useEffect(() => {
    // Get range from URL
    const params = new URLSearchParams(window.location.search);
    const urlRange = params.get("range") || "today";

    if (urlRange !== range) {
      setRange(urlRange);
      fetchData(urlRange);
    }
  }, [range, fetchData]);

  // Calculate max value for chart scaling
  const maxValue = Math.max(...overview.series.map(s => s.value), 1);

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Empty state when no projects
  if (projects.length === 0 && !isRefreshing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome to Plots!
          </h2>
          <p className="text-[#999] mb-6">
            Start tracking your website analytics by adding your first site.
          </p>
          <a
            href="/settings"
            className="inline-block bg-white text-black px-6 py-2 rounded font-medium hover:bg-[#eee] transition-colors"
          >
            Add Your First Website
          </a>
        </div>
      </div>
    );
  }

  // No data state
  const hasNoData = overview.stats.visitors === 0 && overview.stats.pageviews === 0;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#666]">Tracking</div>
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-[#111] border border-[#222] text-white text-sm px-3 py-1 rounded focus:outline-none focus:border-white transition-colors"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[#666]">
            {isRefreshing ? (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-green-500 rounded-full" />
                Live • Updated {timeAgo(lastUpdate)}
              </span>
            )}
          </div>
          <TimeRangeSelector />
        </div>
      </div>

      {/* Waiting for data banner */}
      {hasNoData && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⏳</div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">
                Waiting for your first pageview...
              </h3>
              <p className="text-sm text-[#999] mb-3">
                Make sure you've installed the tracking script on your website. Data will appear here within seconds of your first visitor.
              </p>
              <details className="text-sm">
                <summary className="text-[#666] hover:text-white cursor-pointer">Show tracking script</summary>
                <div className="mt-3 bg-black border border-[#222] rounded p-3">
                  <pre className="text-xs text-white overflow-x-auto">
                    {`<script
  defer
  src="https://api.plots.sh/plots.js"
  data-project="${selectedProject}"
></script>`}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Visitors</div>
          <div className="text-2xl font-bold text-white tabular-nums">{overview.stats.visitors.toLocaleString()}</div>
        </div>
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Pageviews</div>
          <div className="text-2xl font-bold text-white tabular-nums">{overview.stats.pageviews.toLocaleString()}</div>
        </div>
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Bounce Rate</div>
          <div className="text-2xl font-bold text-white tabular-nums">{Math.round(overview.stats.bounceRate)}%</div>
        </div>
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Avg. Duration</div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {overview.stats.avgDuration > 60
              ? `${Math.floor(overview.stats.avgDuration / 60)}m ${overview.stats.avgDuration % 60}s`
              : `${overview.stats.avgDuration}s`}
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="border border-[#222] bg-[#111] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Visitors Over Time</h3>
        <AnalyticsChart data={overview.series} height={240} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Top Pages</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {pages.pages.slice(0, 5).map((page, i) => (
              <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                <div className="text-sm text-white truncate flex-1">{page.path}</div>
                <div className="text-sm text-[#666] tabular-nums ml-4">{page.visitors}</div>
              </div>
            ))}
            {pages.pages.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Top Referrers</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {referrers.referrers.slice(0, 5).map((ref, i) => (
              <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                <div className="text-sm text-white truncate flex-1">{ref.domain || "Direct"}</div>
                <div className="text-sm text-[#666] tabular-nums ml-4">{ref.visitors}</div>
              </div>
            ))}
            {referrers.referrers.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>

        {/* Countries */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Countries</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {countries.countries.slice(0, 5).map((country, i) => (
              <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                <div className="text-sm text-white truncate flex-1">{country.country}</div>
                <div className="text-sm text-[#666] tabular-nums ml-4">{country.percentage.toFixed(0)}%</div>
              </div>
            ))}
            {countries.countries.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Devices</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {devices.devices.slice(0, 5).map((device, i) => {
              const deviceLower = device.device.toLowerCase();
              let icon = '';

              if (deviceLower.includes('mac') || deviceLower.includes('ios')) {
                icon = ' ▄▄▄\n█   █\n█▄▄▄█';
              } else if (deviceLower.includes('windows') || deviceLower.includes('pc')) {
                icon = '█ █\n█▄█\n█ █';
              } else if (deviceLower.includes('linux')) {
                icon = ' ▄█▄\n█▀▀▀\n ▀▀▀';
              } else if (deviceLower.includes('android')) {
                icon = ' ▄ ▄\n█▀▀█\n█▄▄█';
              } else {
                icon = '▄█▄\n█▀█\n▀▀▀';
              }

              return (
                <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center gap-4">
                  <pre className="text-[10px] leading-[1.1] text-[#666] whitespace-pre">
                    {icon}
                  </pre>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="text-sm text-white truncate flex-1">{device.device}</div>
                    <div className="text-sm text-[#666] tabular-nums ml-4">{device.percentage.toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
            {devices.devices.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
