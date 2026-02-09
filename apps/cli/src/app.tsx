// @ts-nocheck
/// <reference path="./opentui-react.d.ts" />

import { useState, useEffect } from "react";
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
import { getOverview, getPages, getCountries, getProjects, getReferrers, getDevices, Project } from "./api";

type ViewType = "overview" | "pages" | "countries" | "tech";
type DateRange = "today" | "7d" | "30d";
type AppState = "project-select" | "dashboard" | "loading" | "error";

interface OverviewData {
  uniqueVisitors: number;
  totalPageviews: number;
  bounceRate: number;
  avgDuration: number;
}

interface PageData {
  path: string;
  views: number;
  unique: number;
}

interface CountryData {
  country: string;
  visitors: number;
  percentage: number;
}

interface ReferrerData {
  referrer: string;
  visitors: number;
}

interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

function sparkline(data: number[]): string {
  if (!data || data.length === 0) return "────────";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  return data
    .map((val) => bars[Math.floor(((val - min) / range) * (bars.length - 1))])
    .join("");
}

export function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [view, setView] = useState<ViewType>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);

  const renderer = useRenderer();
  const { height: terminalHeight } = useTerminalDimensions();

  const project = projects[selectedProjectIndex];

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load data when project or date range changes
  useEffect(() => {
    if (project) {
      loadData();
    }
  }, [selectedProjectIndex, dateRange, projects]);

  async function loadProjects() {
    try {
      setAppState("loading");
      setError(null);
      const result = await getProjects();
      const projectList = result.projects || result || [];
      setProjects(Array.isArray(projectList) ? projectList : []);

      if (projectList.length === 0) {
        setError("No projects found. Create one at https://plots.sh/onboarding");
        setAppState("error");
      } else {
        setAppState("dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
      setAppState("error");
    }
  }

  async function loadData() {
    if (!project) return;

    try {
      const projectId = project.id;
      const range = dateRange;

      // Fetch all data in parallel
      const [overviewRes, pagesRes, countriesRes, referrersRes, devicesRes] = await Promise.all([
        getOverview(range, projectId).catch(() => null),
        getPages(range, projectId).catch(() => []),
        getCountries(range, projectId).catch(() => []),
        getReferrers(range, projectId).catch(() => []),
        getDevices(range, projectId).catch(() => []),
      ]);

      if (overviewRes) {
        setOverview({
          uniqueVisitors: overviewRes.uniqueVisitors || 0,
          totalPageviews: overviewRes.totalPageviews || 0,
          bounceRate: overviewRes.bounceRate || 0,
          avgDuration: overviewRes.avgDuration || 0,
        });
      }

      setPages(Array.isArray(pagesRes) ? pagesRes : (pagesRes?.pages || []));
      setCountries(Array.isArray(countriesRes) ? countriesRes : (countriesRes?.countries || []));
      setReferrers(Array.isArray(referrersRes) ? referrersRes : (referrersRes?.referrers || []));
      setDevices(Array.isArray(devicesRes) ? devicesRes : (devicesRes?.devices || []));

    } catch (err: any) {
      console.error("Failed to load data:", err);
    }
  }

  useKeyboard((key) => {
    // Global quit
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      renderer.destroy();
      return;
    }

    // Project switcher
    if (appState === "dashboard" && key.ctrl && key.name === "p") {
      setShowProjectSwitcher(!showProjectSwitcher);
      return;
    }

    if (showProjectSwitcher) {
      if (key.name === "escape") {
        setShowProjectSwitcher(false);
      } else if (key.name === "up") {
        setProjectIndex((i: number) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        setProjectIndex((i: number) => Math.min(projects.length - 1, i + 1));
      } else if (key.name === "return") {
        setSelectedProjectIndex(projectIndex);
        setShowProjectSwitcher(false);
      }
      return;
    }

    // Dashboard navigation
    if (appState === "dashboard") {
      if (key.name === "1") setView("overview");
      if (key.name === "2") setView("pages");
      if (key.name === "3") setView("countries");
      if (key.name === "4") setView("tech");

      // Date range shortcuts
      if (key.name === "d") setDateRange("today");
      if (key.name === "w") setDateRange("7d");
      if (key.name === "m") setDateRange("30d");

      // Back to project selection
      if (key.name === "escape") {
        setAppState("project-select");
      }

      // Refresh
      if (key.name === "r") {
        loadData();
      }
    }

    // Project selection navigation
    if (appState === "project-select") {
      if (key.name === "up") {
        setSelectedProjectIndex((i: number) => Math.max(0, i - 1));
      } else if (key.name === "down") {
        setSelectedProjectIndex((i: number) => Math.min(projects.length - 1, i + 1));
      } else if (key.name === "return") {
        setAppState("dashboard");
      }
    }
  });

  const dateRangeLabel: Record<DateRange, string> = {
    "today": "Today",
    "7d": "Last 7 days",
    "30d": "Last 30 days"
  };
  const dateRangeLabelText = dateRangeLabel[dateRange];

  // Loading Screen
  if (appState === "loading") {
    return (
      <box flexDirection="column" width="100%" height="100%" backgroundColor="#000000" justifyContent="center" alignItems="center">
        <box marginBottom={2}>
          <ascii-font text="plots" font="tiny" color="#ffffff" />
        </box>
        <text><span fg="#8b949e">Loading...</span></text>
      </box>
    );
  }

  // Error Screen
  if (appState === "error") {
    return (
      <box flexDirection="column" width="100%" height="100%" backgroundColor="#000000" justifyContent="center" alignItems="center">
        <box marginBottom={2}>
          <ascii-font text="plots" font="tiny" color="#ffffff" />
        </box>
        <text><span fg="#f85149">Error: {error}</span></text>
        <box marginTop={2}>
          <text><span fg="#8b949e">Press Q to quit</span></text>
        </box>
      </box>
    );
  }

  // Project Selection Screen
  if (appState === "project-select") {
    return (
      <box flexDirection="column" width="100%" height="100%" backgroundColor="#000000" justifyContent="center" alignItems="center">
        <box marginBottom={3}>
          <ascii-font text="plots" font="tiny" color="#ffffff" />
        </box>

        <box width={60} backgroundColor="#09090b" padding={2}>
          <box marginBottom={2}>
            <text><span fg="#c9d1d9"><strong>Select a Project</strong></span></text>
          </box>

          {projects.length === 0 ? (
            <text><span fg="#8b949e">No projects found</span></text>
          ) : (
            <box flexDirection="column">
              {projects.map((p, i) => (
                <box key={p.id} padding={1} backgroundColor={i === selectedProjectIndex ? "#0d419d" : "transparent"}>
                  <text>
                    <span fg={i === selectedProjectIndex ? "#ffffff" : "#c9d1d9"}>{p.name}</span>
                    <span fg={i === selectedProjectIndex ? "#c9d1d9" : "#8b949e"}> {p.domain}</span>
                  </text>
                </box>
              ))}
            </box>
          )}

          <box marginTop={2} borderTop paddingTop={1}>
            <text><span fg="#8b949e">↑↓ Navigate • Enter Select • Q Quit</span></text>
          </box>
        </box>
      </box>
    );
  }

  // Dashboard View
  return (
    <box flexDirection="column" width="100%" backgroundColor="#000000">
      {/* Header */}
      <box padding={1} backgroundColor="#000000">
        <box flexDirection="row" justifyContent="space-between" alignItems="center">
          <box>
            <ascii-font text="plots" font="tiny" color="#ffffff" />
          </box>
          <box flexDirection="column" alignItems="flex-end">
            <text><span fg="#c9d1d9"><strong>{project?.name || "No Project"}</strong></span></text>
            <text><span fg="#8b949e">{project?.domain || ""}</span></text>
          </box>
        </box>
      </box>

      <scrollbox height={terminalHeight - 6} focused>
        {/* Date Range */}
        <box padding={1} paddingTop={0} paddingBottom={0} flexDirection="row" gap={2} backgroundColor="#000000">
          <text><span fg="#8b949e">Range:</span></text>
          {(["today", "7d", "30d"] as DateRange[]).map((range) => (
            <text key={range}>
              <span fg={dateRange === range ? "#58a6ff" : "#6e7681"}>
                {range === "today" ? "[D]" : range === "7d" ? "[W]" : "[M]"} {range}
              </span>
            </text>
          ))}
          <box flexGrow={1} />
          <text><span fg="#56d364">●</span> <span fg="#8b949e">{dateRangeLabelText} • [R] Refresh</span></text>
        </box>

        {/* Stats Row */}
        <box flexDirection="row" padding={1} paddingTop={0} gap={2} width="100%" height={10}>
          <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
            <text><span fg="#8b949e">Visitors</span></text>
            <text><span fg="#c9d1d9"><strong>{(overview?.uniqueVisitors || 0).toLocaleString()}</strong></span></text>
          </box>

          <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
            <text><span fg="#8b949e">Pageviews</span></text>
            <text><span fg="#c9d1d9"><strong>{(overview?.totalPageviews || 0).toLocaleString()}</strong></span></text>
          </box>

          <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
            <text><span fg="#8b949e">Bounce Rate</span></text>
            <text><span fg="#f79c6a"><strong>{overview?.bounceRate || 0}%</strong></span></text>
          </box>

          <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
            <text><span fg="#8b949e">Avg Duration</span></text>
            <text><span fg="#d2a8ff"><strong>{Math.floor((overview?.avgDuration || 0) / 60)}m {(overview?.avgDuration || 0) % 60}s</strong></span></text>
          </box>
        </box>

        {/* Main Content */}
        <box flexGrow={1} padding={1} paddingTop={0}>
          {view === "overview" && <OverviewView pages={pages} countries={countries} referrers={referrers} />}
          {view === "pages" && <PagesView pages={pages} />}
          {view === "countries" && <CountriesView countries={countries} />}
          {view === "tech" && <TechView devices={devices} />}
        </box>

      </scrollbox>

      {/* Footer */}
      <box padding={1} flexDirection="row" justifyContent="space-between" backgroundColor="#09090b">
        <box flexDirection="row" gap={3}>
          <text>
            <span fg="#8b949e">1</span>
            <span fg={view === "overview" ? "#58a6ff" : "#6e7681"}> Overview</span>
          </text>
          <text>
            <span fg="#8b949e">2</span>
            <span fg={view === "pages" ? "#58a6ff" : "#6e7681"}> Pages</span>
          </text>
          <text>
            <span fg="#8b949e">3</span>
            <span fg={view === "countries" ? "#58a6ff" : "#6e7681"}> Countries</span>
          </text>
          <text>
            <span fg="#8b949e">4</span>
            <span fg={view === "tech" ? "#58a6ff" : "#6e7681"}> Tech</span>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text>
            <span fg="#8b949e">Esc</span>
            <span fg="#6e7681"> Projects</span>
          </text>
          <text>
            <span fg="#8b949e">Q</span>
            <span fg="#6e7681"> Quit</span>
          </text>
        </box>
      </box>

      {/* Project Switcher */}
      {showProjectSwitcher && (
        <box position="absolute" top="50%" left="50%" width={60} padding={1} flexDirection="column" backgroundColor="#09090b">
          <box marginBottom={1}>
            <text><span fg="#c9d1d9"><strong>Switch Project</strong></span></text>
          </box>
          {projects.map((proj, i) => (
            <box key={proj.id} padding={1} backgroundColor={i === projectIndex ? "#0d419d" : "transparent"}>
              <text>
                <span fg={i === projectIndex ? "#ffffff" : "#c9d1d9"}>{proj.name}</span>
                <span fg={i === projectIndex ? "#c9d1d9" : "#8b949e"}> {proj.domain}</span>
              </text>
            </box>
          ))}
          <box marginTop={1}>
            <text><span fg="#8b949e">↑↓ Navigate • Enter Select • Esc Cancel</span></text>
          </box>
        </box>
      )}
    </box>
  );
}

function OverviewView({ pages, countries, referrers }: { pages: PageData[], countries: CountryData[], referrers: ReferrerData[] }) {
  return (
    <box flexDirection="column" gap={1} width="100%">
      {/* Top Row: Pages and Referrers */}
      <box flexDirection="row" gap={1} width="100%">
        {/* Top Pages */}
        <box width="50%" padding={1} flexDirection="column" backgroundColor="#09090b">
          <text><span fg="#c9d1d9"><strong>Top Pages</strong></span></text>
          <box flexDirection="row" marginTop={1}>
            <box width={20}><text><span fg="#8b949e">Path</span></text></box>
            <box width={10}><text><span fg="#8b949e">Views</span></text></box>
            <box width={10}><text><span fg="#8b949e">Unique</span></text></box>
          </box>
          <box flexDirection="column">
            {pages.length === 0 ? (
              <text><span fg="#6e7681">No data yet</span></text>
            ) : (
              pages.slice(0, 8).map((page, i) => {
                const maxLen = 18;
                const truncated = page.path.length > maxLen ? page.path.substring(0, maxLen - 1) + "…" : page.path;
                return (
                  <box key={page.path} flexDirection="row" marginTop={i === 0 ? 0 : 1}>
                    <box width={20}>
                      <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{truncated}</span></text>
                    </box>
                    <box width={10}>
                      <text><span fg="#58a6ff">{page.views.toLocaleString()}</span></text>
                    </box>
                    <box width={10}>
                      <text><span fg="#79c0ff">{page.unique.toLocaleString()}</span></text>
                    </box>
                  </box>
                );
              })
            )}
          </box>
        </box>

        {/* Top Referrers */}
        <box width="50%" padding={1} flexDirection="column" backgroundColor="#09090b">
          <text><span fg="#c9d1d9"><strong>Top Referrers</strong></span></text>
          <box flexDirection="row" marginTop={1}>
            <box width={25}><text><span fg="#8b949e">Referrer</span></text></box>
            <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
          </box>
          <box flexDirection="column" gap={1} marginTop={1}>
            {referrers.length === 0 ? (
              <text><span fg="#6e7681">No data yet</span></text>
            ) : (
              referrers.slice(0, 7).map((ref, i) => {
                const maxLen = 22;
                const displayName = ref.referrer || "Direct";
                const truncated = displayName.length > maxLen ? displayName.substring(0, maxLen - 1) + "…" : displayName;
                return (
                  <box key={ref.referrer || "direct"} flexDirection="row">
                    <box width={24}>
                      <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{truncated}</span></text>
                    </box>
                    <box width={10}>
                      <text><span fg="#58a6ff">{ref.visitors.toLocaleString()}</span></text>
                    </box>
                  </box>
                );
              })
            )}
          </box>
        </box>
      </box>

      {/* Bottom Row: Countries */}
      <box flexDirection="row" gap={1} width="100%">
        <box width="100%" padding={1} flexDirection="column" backgroundColor="#09090b">
          <text><span fg="#c9d1d9"><strong>Top Countries</strong></span></text>
          <box flexDirection="row" marginTop={1}>
            <box width={18}><text><span fg="#8b949e">Country</span></text></box>
            <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
            <box width={8}><text><span fg="#8b949e">Share</span></text></box>
          </box>
          <box flexDirection="column">
            {countries.length === 0 ? (
              <text><span fg="#6e7681">No data yet</span></text>
            ) : (
              countries.slice(0, 8).map((country, i) => {
                const maxLen = 16;
                const truncated = country.country.length > maxLen ? country.country.substring(0, maxLen - 1) + "…" : country.country;
                return (
                  <box key={country.country} flexDirection="row" marginTop={i === 0 ? 0 : 1}>
                    <box width={18}>
                      <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{truncated}</span></text>
                    </box>
                    <box width={10}>
                      <text><span fg="#58a6ff">{country.visitors.toLocaleString()}</span></text>
                    </box>
                    <box width={8}>
                      <text><span fg="#f79c6a">{country.percentage}%</span></text>
                    </box>
                  </box>
                );
              })
            )}
          </box>
        </box>
      </box>
    </box>
  );
}

function PagesView({ pages }: { pages: PageData[] }) {
  return (
    <box padding={1} flexDirection="column" backgroundColor="#09090b">
      <text><span fg="#c9d1d9"><strong>All Pages</strong></span></text>
      <box flexDirection="row" marginTop={1}>
        <box width={30}><text><span fg="#8b949e">Path</span></text></box>
        <box width={10}><text><span fg="#8b949e">Views</span></text></box>
        <box width={10}><text><span fg="#8b949e">Unique</span></text></box>
      </box>
      <box flexDirection="column">
        {pages.length === 0 ? (
          <text><span fg="#6e7681">No data yet</span></text>
        ) : (
          pages.map((page, i) => {
            const maxLen = 28;
            const truncated = page.path.length > maxLen ? page.path.substring(0, maxLen - 1) + "…" : page.path;
            return (
              <box key={page.path} flexDirection="row" marginTop={i === 0 ? 0 : 1}>
                <box width={30}>
                  <text><span fg={i < 3 ? "#56d364" : "#c9d1d9"}>{truncated}</span></text>
                </box>
                <box width={10}>
                  <text><span fg="#58a6ff">{page.views.toLocaleString()}</span></text>
                </box>
                <box width={10}>
                  <text><span fg="#79c0ff">{page.unique.toLocaleString()}</span></text>
                </box>
              </box>
            );
          })
        )}
      </box>
    </box>
  );
}

function CountriesView({ countries }: { countries: CountryData[] }) {
  return (
    <box padding={1} flexDirection="column" backgroundColor="#09090b">
      <text><span fg="#c9d1d9"><strong>All Countries</strong></span></text>
      <box flexDirection="row" marginTop={1}>
        <box width={20}><text><span fg="#8b949e">Country</span></text></box>
        <box width={12}><text><span fg="#8b949e">Visitors</span></text></box>
        <box width={10}><text><span fg="#8b949e">Share</span></text></box>
      </box>
      <box flexDirection="column">
        {countries.length === 0 ? (
          <text><span fg="#6e7681">No data yet</span></text>
        ) : (
          countries.map((country, i) => {
            const maxLen = 18;
            const truncated = country.country.length > maxLen ? country.country.substring(0, maxLen - 1) + "…" : country.country;
            return (
              <box key={country.country} flexDirection="row" marginTop={i === 0 ? 0 : 1}>
                <box width={20}>
                  <text><span fg={i < 3 ? "#56d364" : "#c9d1d9"}>{truncated}</span></text>
                </box>
                <box width={12}>
                  <text><span fg="#58a6ff">{country.visitors.toLocaleString()}</span></text>
                </box>
                <box width={10}>
                  <text><span fg="#f79c6a">{country.percentage}%</span></text>
                </box>
              </box>
            );
          })
        )}
      </box>
    </box>
  );
}

function TechView({ devices }: { devices: DeviceData[] }) {
  return (
    <box flexDirection="row" gap={1} width="100%">
      {/* Devices */}
      <box width="100%" padding={1} flexDirection="column" backgroundColor="#09090b">
        <text marginTop={1}><span fg="#c9d1d9"><strong>Devices</strong></span></text>
        <box flexDirection="row" marginTop={1}>
          <box width={15}><text><span fg="#8b949e">Device</span></text></box>
          <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
          <box flexGrow={1}><text><span fg="#8b949e">Share</span></text></box>
        </box>
        {devices.length === 0 ? (
          <text><span fg="#6e7681">No data yet</span></text>
        ) : (
          devices.map((device, i) => (
            <box key={device.device} flexDirection="row" marginTop={1}>
              <box width={15}>
                <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{device.device}</span></text>
              </box>
              <box width={10}>
                <text><span fg="#58a6ff">{device.visitors.toLocaleString()}</span></text>
              </box>
              <box flexGrow={1}>
                <text><span fg="#f79c6a">{device.percentage}%</span></text>
              </box>
            </box>
          ))
        )}
      </box>
    </box>
  );
}
