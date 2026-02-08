// Main TUI application
import { useState, useEffect } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import type { TimeRange } from "./state";
import type { OverviewResponse, PagesResponse, ReferrersResponse, CountriesResponse, DevicesResponse } from "@plots/ui";
import { getOverview, getPages, getReferrers, getCountries, getDevices } from "./api";

export function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [pages, setPages] = useState<PagesResponse | null>(null);
  const [referrers, setReferrers] = useState<ReferrersResponse | null>(null);
  const [countries, setCountries] = useState<CountriesResponse | null>(null);
  const [devices, setDevices] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const renderer = useRenderer();

  // Fetch all data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOverview(timeRange),
      getPages(timeRange),
      getReferrers(timeRange),
      getCountries(timeRange),
      getDevices(timeRange),
    ])
      .then(([o, p, r, c, d]) => {
        setOverview(o);
        setPages(p);
        setReferrers(r);
        setCountries(c);
        setDevices(d);
      })
      .finally(() => setLoading(false));
  }, [timeRange]);

  // Keyboard shortcuts
  useKeyboard((key) => {
    if (key.name === "t") setTimeRange("today");
    if (key.name === "y") setTimeRange("yesterday");
    if (key.name === "7") setTimeRange("7d");
    if (key.name === "3") setTimeRange("30d");
    if (key.name === "r") window.location.reload();
    if (key.name === "q" || key.name === "escape") {
      renderer.destroy();
    }
  });

  const timeRangeLabel = {
    today: "Today",
    yesterday: "Yesterday",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
  }[timeRange];

  if (loading || !overview) {
    return (
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <text>Loading analytics...</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* Header */}
      <box borderStyle="double" borderColor="cyan" padding={1} flexDirection="row" justifyContent="space-between">
        <box gap={2}>
          <ascii-font font="tiny" text="PLOTS" color="cyan" />
          <text fg="gray">proj_demo</text>
        </box>
        <box gap={2}>
          <text fg="cyan">{timeRangeLabel}</text>
          <text fg="gray">|</text>
          <text fg="yellow">[T/Y/7/3] Range | [R] Refresh | [Q] Quit</text>
        </box>
      </box>

      {/* Stats */}
      <box flexDirection="row" gap={2} padding={1}>
        <box borderStyle="single" borderColor="cyan" padding={1} flexGrow={1}>
          <box flexDirection="column">
            <text fg="cyan">VISITORS</text>
            <text><strong>{overview.stats.visitors}</strong></text>
          </box>
        </box>
        <box borderStyle="single" borderColor="green" padding={1} flexGrow={1}>
          <box flexDirection="column">
            <text fg="green">PAGEVIEWS</text>
            <text><strong>{overview.stats.pageviews}</strong></text>
          </box>
        </box>
        <box borderStyle="single" borderColor="yellow" padding={1} flexGrow={1}>
          <box flexDirection="column">
            <text fg="yellow">BOUNCE RATE</text>
            <text><strong>{(overview.stats.bounceRate * 100).toFixed(1)}%</strong></text>
          </box>
        </box>
      </box>

      {/* Content Grid */}
      <box flexDirection="row" flexGrow={1} gap={1} padding={1}>
        {/* Left Column */}
        <box flexDirection="column" flexGrow={1} gap={1}>
          {/* Pages */}
          <box borderStyle="single" borderColor="white" flexDirection="column" flexGrow={1}>
            <text fg="white"><strong>TOP PAGES</strong></text>
            <box height={1} />
            <box flexDirection="column">
              {pages?.pages.slice(0, 6).map((page, i) => (
                <box key={i} flexDirection="row" justifyContent="space-between">
                  <text width={30}>{page.path.substring(0, 28)}</text>
                  <text fg="gray">{page.visitors}</text>
                </box>
              ))}
            </box>
          </box>

          {/* Referrers */}
          <box borderStyle="single" borderColor="white" flexDirection="column" flexGrow={1}>
            <text fg="white"><strong>TOP REFERRERS</strong></text>
            <box height={1} />
            <box flexDirection="column">
              {referrers?.referrers.slice(0, 6).map((ref, i) => (
                <box key={i} flexDirection="row" justifyContent="space-between">
                  <text width={30}>{(ref.domain || "Direct").substring(0, 28)}</text>
                  <text fg="gray">{ref.visitors}</text>
                </box>
              ))}
            </box>
          </box>
        </box>

        {/* Right Column */}
        <box flexDirection="column" flexGrow={1} gap={1}>
          {/* Countries */}
          <box borderStyle="single" borderColor="white" flexDirection="column" flexGrow={1}>
            <text fg="white"><strong>COUNTRIES</strong></text>
            <box height={1} />
            <box flexDirection="column">
              {countries?.countries.slice(0, 6).map((country, i) => (
                <box key={i} flexDirection="row" justifyContent="space-between">
                  <text width={30}>{country.country}</text>
                  <text fg="gray">{country.percentage.toFixed(0)}%</text>
                </box>
              ))}
            </box>
          </box>

          {/* Devices */}
          <box borderStyle="single" borderColor="white" flexDirection="column" flexGrow={1}>
            <text fg="white"><strong>DEVICES</strong></text>
            <box height={1} />
            <box flexDirection="column">
              {devices?.devices.slice(0, 6).map((device, i) => (
                <box key={i} flexDirection="row" justifyContent="space-between">
                  <text width={30}>{device.device}</text>
                  <text fg="gray">{device.percentage.toFixed(0)}%</text>
                </box>
              ))}
            </box>
          </box>
        </box>
      </box>
    </box>
  );
}
