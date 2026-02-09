// @ts-nocheck
/// <reference path="./opentui-react.d.ts" />

import { useState, useEffect } from "react";
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
import { getOverview, getPages, getCountries } from "./api";

type ViewType = "overview" | "pages" | "countries" | "tech";
type DateRange = "24h" | "7d" | "30d" | "12m";
type AppState = "project-select" | "dashboard" | "loading";

function sparkline(data: number[]): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  return data
    .map((val) => bars[Math.floor(((val - min) / range) * (bars.length - 1))])
    .join("");
}

export function App() {
  const [appState, setAppState] = useState<AppState>("dashboard");
  const [view, setView] = useState<ViewType>("overview");
  const [range, setRange] = useState<DateRange>("7d");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [range, view]);

  async function loadData() {
    try {
      setAppState("loading");
      setError(null);
      
      let result;
      if (view === "overview") {
        result = await getOverview(range);
      } else if (view === "pages") {
        result = await getPages(range);
      } else if (view === "countries") {
        result = await getCountries(range);
      }
      
      setData(result);
      setAppState("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      setAppState("dashboard");
    }
  }
  const [projectIndex, setProjectIndex] = useState(0);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const renderer = useRenderer();
  const { height: terminalHeight } = useTerminalDimensions();

  const project = mockProjects[selectedProjectIndex];

  useKeyboard((key) => {
    // Global quit
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      renderer.destroy();
      return;
    }

    // Project switcher (only in dashboard)
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
        setProjectIndex((i: number) => Math.min(mockProjects.length - 1, i + 1));
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
      if (key.name === "d") setDateRange("24h");
      if (key.name === "w") setDateRange("7d");
      if (key.name === "m") setDateRange("30d");
      if (key.name === "y") setDateRange("12m");

      // Back to project selection
      if (key.name === "escape") {
        setAppState("project-select");
      }
    }
  });

  const pageviewsChart = mockChartData.map((d) => d.pageviews);
  const visitorsChart = mockChartData.map((d) => d.visitors);

  const dateRangeLabel: Record<DateRange, string> = {
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "12m": "Last 12 months"
  };
  const dateRangeLabelText = dateRangeLabel[dateRange];

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
          
          <select
            options={mockProjects.map(p => ({
              name: p.name,
              description: p.domain,
              value: p
            }))}
            onSelect={(index) => {
              setSelectedProjectIndex(index);
              setProjectIndex(index);
              setAppState("dashboard");
            }}
            selectedIndex={selectedProjectIndex}
            height={Math.min(10, mockProjects.length)}
            focused
          />
          
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
      {/* Header with ASCII Font Logo */}
      <box padding={1} backgroundColor="#000000">
        <box flexDirection="row" justifyContent="space-between" alignItems="center">
          <box>
            <ascii-font text="plots" font="tiny" color="#ffffff" />
          </box>
          <box flexDirection="column" alignItems="flex-end">
            <text><span fg="#c9d1d9"><strong>{project.name}</strong></span></text>
            <text><span fg="#8b949e">{project.domain}</span></text>
          </box>
        </box>
      </box>

      
      <scrollbox height={terminalHeight - 6} focused>
      {/* Date Range */}
      <box padding={1} paddingTop={0} paddingBottom={0} flexDirection="row" gap={2} backgroundColor="#000000">
        <text><span fg="#8b949e">Range:</span></text>
        {(["24h", "7d", "30d", "12m"] as DateRange[]).map((range) => (
          <text key={range}>
            <span fg={dateRange === range ? "#58a6ff" : "#6e7681"}>
              {range === "24h" ? "[D]" : range === "7d" ? "[W]" : range === "30d" ? "[M]" : "[Y]"} {range}
            </span>
          </text>
        ))}
        <box flexGrow={1} />
        <text><span fg="#56d364">●</span> <span fg="#8b949e">Live • {dateRangeLabelText}</span></text>
      </box>

      {/* Stats Row */}
      <box flexDirection="row" padding={1} paddingTop={0} gap={2} width="100%" height={10}>
        <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
          <text><span fg="#8b949e">Visitors</span></text>
          <text><span fg="#c9d1d9"><strong>{mockStats.uniqueVisitors.toLocaleString()}</strong></span></text>
          <text><span fg="#56d364">↑ 8.7%</span></text>
        </box>

        <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
          <text><span fg="#8b949e">Pageviews</span></text>
          <text><span fg="#c9d1d9"><strong>{mockStats.totalPageviews.toLocaleString()}</strong></span></text>
          <text><span fg="#56d364">↑ 12.3%</span></text>
        </box>

        <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
          <text><span fg="#8b949e">Bounce Rate</span></text>
          <text><span fg="#f79c6a"><strong>{mockStats.bounceRate}%</strong></span></text>
          <text><span fg="#56d364">↓ 2.1%</span></text>
        </box>

        <box width="25%" padding={1} flexDirection="column" gap={1} backgroundColor="#09090b">
          <text><span fg="#8b949e">Avg Duration</span></text>
          <text><span fg="#d2a8ff"><strong>4m 12s</strong></span></text>
          <text><span fg="#56d364">↑ 15s</span></text>
        </box>
      </box>

      {/* Chart */}
      <box padding={1} paddingLeft={2} paddingRight={2} flexDirection="column" backgroundColor="#09090b" marginLeft={1} marginRight={1} marginBottom={1} height={8}>
        <text><span fg="#c9d1d9"><strong>Traffic Trend</strong></span></text>
        <box flexGrow={1} justifyContent="center">
          <text><span fg="#58a6ff">{sparkline(pageviewsChart)}{sparkline(pageviewsChart)}{sparkline(pageviewsChart)}{sparkline(pageviewsChart)}</span></text>
        </box>
        <box flexDirection="row" gap={4}>
          <text><span fg="#8b949e">Peak:</span> <span fg="#c9d1d9">3,421</span></text>
          <text><span fg="#8b949e">Avg:</span> <span fg="#c9d1d9">2,156</span></text>
          <box flexGrow={1} />
          <text><span fg="#6e7681">Pageviews over {dateRangeLabelText.toLowerCase()}</span></text>
        </box>
      </box>

      {/* Main Content */}
      <box flexGrow={1} padding={1} paddingTop={0}>
        {view === "overview" && <OverviewView />}
        {view === "pages" && <PagesView />}
        {view === "countries" && <CountriesView />}
        {view === "tech" && <TechView />}
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
          {mockProjects.map((proj, i) => (
            <box key={proj.domain} padding={1} backgroundColor={i === projectIndex ? "#0d419d" : "transparent"}>
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

function OverviewView() {
  return (
    <box flexDirection="column" gap={1} width="100%">
      {/* Top Row: Pages and Sources */}
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
            {mockTopPages.map((page, i) => {
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
            })}
          </box>
        </box>

        {/* Traffic Sources */}
        <box width="50%" padding={1} flexDirection="column" backgroundColor="#09090b">
          <text><span fg="#c9d1d9"><strong>Traffic Sources</strong></span></text>
          <box flexDirection="row" marginTop={1}>
            <box width={15}><text><span fg="#8b949e">Source</span></text></box>
            <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
          </box>
          <box flexDirection="column" gap={1} marginTop={1}>
              {[
                { name: "Google", visitors: 4234, color: "#58a6ff" },
                { name: "Direct", visitors: 3102, color: "#58a6ff" },
                { name: "Twitter", visitors: 1876, color: "#58a6ff" },
                { name: "GitHub", visitors: 945, color: "#58a6ff" },
                { name: "Reddit", visitors: 623, color: "#58a6ff" },
                { name: "Other", visitors: 456, color: "#58a6ff" },
                { name: "LinkedIn", visitors: 234, color: "#58a6ff" },
                { name: "Facebook", visitors: 123, color: "#58a6ff" }
              ].map((source, i) => (
                <box key={source.name} flexDirection="row">
                  <box width={15}>
                    <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{source.name}</span></text>
                  </box>
                  <box width={10}>
                    <text><span fg={source.color}>{source.visitors.toLocaleString()}</span></text>
                  </box>
                </box>
              ))}
          </box>
        </box>
      </box>

      {/* Bottom Row: Countries and Referrers */}
      <box flexDirection="row" gap={1} width="100%">
        {/* Countries */}
        <box width="50%" padding={1} flexDirection="column" backgroundColor="#09090b">
          <text><span fg="#c9d1d9"><strong>Top Countries</strong></span></text>
          <box flexDirection="row" marginTop={1}>
            <box width={18}><text><span fg="#8b949e">Country</span></text></box>
            <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
            <box width={8}><text><span fg="#8b949e">Share</span></text></box>
          </box>
          <box flexDirection="column">
            {mockTopCountries.map((country, i) => {
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
            })}
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
              {[
                { url: "news.ycombinator.com", visitors: 1523 },
                { url: "reddit.com/r/webdev", visitors: 891 },
                { url: "twitter.com", visitors: 734 },
                { url: "dev.to", visitors: 456 },
                { url: "github.com", visitors: 289 },
                { url: "stackoverflow.com", visitors: 156 },
                { url: "medium.com", visitors: 98 }
              ].map((ref, i) => {
                const maxLen = 22;
                const truncated = ref.url.length > maxLen ? ref.url.substring(0, maxLen - 1) + "…" : ref.url;
                return (
                  <box key={ref.url} flexDirection="row">
                    <box width={24}>
                      <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{truncated}</span></text>
                    </box>
                    <box width={10}>
                      <text><span fg="#58a6ff">{ref.visitors.toLocaleString()}</span></text>
                    </box>
                  </box>
                );
              })}
          </box>
        </box>
      </box>
    </box>
  );
}

function PagesView() {
  const bounceRate = (n: number) => (Math.random() * 60 + 20).toFixed(1);
  const avgTime = (n: number) => Math.floor(Math.random() * 180 + 60);
  
  return (
    <box padding={1} flexDirection="column" backgroundColor="#09090b">
      <text><span fg="#c9d1d9"><strong>All Pages</strong></span></text>
      <box flexDirection="row" marginTop={1}>
        <box width={30}><text><span fg="#8b949e">Path</span></text></box>
        <box width={10}><text><span fg="#8b949e">Views</span></text></box>
        <box width={10}><text><span fg="#8b949e">Unique</span></text></box>
        <box width={10}><text><span fg="#8b949e">Bounce</span></text></box>
        <box width={10}><text><span fg="#8b949e">Avg Time</span></text></box>
      </box>
      <box flexDirection="column">
        {mockTopPages.map((page, i) => {
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
              <box width={10}>
                <text><span fg="#f79c6a">{bounceRate(i)}%</span></text>
              </box>
              <box width={10}>
                <text><span fg="#d2a8ff">{avgTime(i)}s</span></text>
              </box>
            </box>
          );
        })}
      </box>
    </box>
  );
}

function CountriesView() {
  return (
    <box padding={1} flexDirection="column" backgroundColor="#09090b">
      <text><span fg="#c9d1d9"><strong>All Countries</strong></span></text>
      <box flexDirection="row" marginTop={1}>
        <box width={20}><text><span fg="#8b949e">Country</span></text></box>
        <box width={12}><text><span fg="#8b949e">Visitors</span></text></box>
        <box width={10}><text><span fg="#8b949e">Share</span></text></box>
        <box width={12}><text><span fg="#8b949e">Pageviews</span></text></box>
      </box>
      <box flexDirection="column">
        {mockTopCountries.map((country, i) => {
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
              <box width={12}>
                <text><span fg="#79c0ff">{Math.floor(country.visitors * 1.8).toLocaleString()}</span></text>
              </box>
            </box>
          );
        })}
      </box>
    </box>
  );
}

function TechView() {
  const browsers = [
    { name: "Chrome", visitors: 3245, percentage: 54 },
    { name: "Firefox", visitors: 1456, percentage: 24 },
    { name: "Safari", visitors: 892, percentage: 15 },
    { name: "Edge", visitors: 267, percentage: 4 },
    { name: "Other", visitors: 180, percentage: 3 }
  ];

  const os = [
    { name: "Windows", visitors: 2890, percentage: 48 },
    { name: "macOS", visitors: 1734, percentage: 29 },
    { name: "Linux", visitors: 901, percentage: 15 },
    { name: "Android", visitors: 361, percentage: 6 },
    { name: "iOS", visitors: 154, percentage: 2 }
  ];

  const devices = [
    { name: "Desktop", visitors: 4245, percentage: 71 },
    { name: "Mobile", visitors: 1456, percentage: 24 },
    { name: "Tablet", visitors: 339, percentage: 5 }
  ];

  return (
    <box flexDirection="row" gap={1} width="100%">
      {/* Browsers */}
      <box width="33%" padding={1} flexDirection="column" backgroundColor="#09090b">
        <text marginTop={1}><span fg="#c9d1d9"><strong>Browsers</strong></span></text>
        <box flexDirection="row" marginTop={1}>
          <box width={15}><text><span fg="#8b949e">Browser</span></text></box>
          <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
          <box flexGrow={1}><text><span fg="#8b949e">Share</span></text></box>
        </box>
        {browsers.map((browser, i) => (
          <box key={browser.name} flexDirection="row" marginTop={1}>
            <box width={15}>
              <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{browser.name}</span></text>
            </box>
            <box width={10}>
              <text><span fg="#58a6ff">{browser.visitors.toLocaleString()}</span></text>
            </box>
            <box flexGrow={1}>
              <text><span fg="#f79c6a">{browser.percentage}%</span></text>
            </box>
          </box>
        ))}
      </box>

      {/* Operating Systems */}
      <box width="33%" padding={1} flexDirection="column" backgroundColor="#09090b">
        <text marginTop={1}><span fg="#c9d1d9"><strong>Operating Systems</strong></span></text>
        <box flexDirection="row" marginTop={1}>
          <box width={15}><text><span fg="#8b949e">OS</span></text></box>
          <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
          <box flexGrow={1}><text><span fg="#8b949e">Share</span></text></box>
        </box>
        {os.map((system, i) => (
          <box key={system.name} flexDirection="row" marginTop={1}>
            <box width={15}>
              <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{system.name}</span></text>
            </box>
            <box width={10}>
              <text><span fg="#58a6ff">{system.visitors.toLocaleString()}</span></text>
            </box>
            <box flexGrow={1}>
              <text><span fg="#f79c6a">{system.percentage}%</span></text>
            </box>
          </box>
        ))}
      </box>

      {/* Devices */}
      <box width="34%" padding={1} flexDirection="column" backgroundColor="#09090b">
        <text marginTop={1}><span fg="#c9d1d9"><strong>Devices</strong></span></text>
        <box flexDirection="row" marginTop={1}>
          <box width={15}><text><span fg="#8b949e">Device</span></text></box>
          <box width={10}><text><span fg="#8b949e">Visitors</span></text></box>
          <box flexGrow={1}><text><span fg="#8b949e">Share</span></text></box>
        </box>
        {devices.map((device, i) => (
          <box key={device.name} flexDirection="row" marginTop={1}>
            <box width={15}>
              <text><span fg={i === 0 ? "#56d364" : "#c9d1d9"}>{device.name}</span></text>
            </box>
            <box width={10}>
              <text><span fg="#58a6ff">{device.visitors.toLocaleString()}</span></text>
            </box>
            <box flexGrow={1}>
              <text><span fg="#f79c6a">{device.percentage}%</span></text>
            </box>
          </box>
        ))}
      </box>
    </box>
  );
}

