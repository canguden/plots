// Overview view - main dashboard
import { useEffect, useState } from "react";
import type { OverviewResponse } from "@plots/ui";
import { getOverview } from "../api";
import type { TimeRange } from "../state";

interface Props {
  timeRange: TimeRange;
}

export function Overview({ timeRange }: Props) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    getOverview(timeRange)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) {
    return (
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <text>Loading...</text>
      </box>
    );
  }

  if (error) {
    return (
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <text fg="red">Error: {error}</text>
      </box>
    );
  }

  if (!data) return null;

  const { stats, topPages, series } = data;

  return (
    <box flexDirection="column" flexGrow={1} padding={1} gap={1}>
      {/* Stats Cards */}
      <box flexDirection="row" gap={2}>
        <box
          borderStyle="single"
          borderColor="blue"
          padding={1}
          flexGrow={1}
        >
          <box flexDirection="column">
            <text fg="cyan">Visitors</text>
            <text><strong>{stats.visitors.toLocaleString()}</strong></text>
          </box>
        </box>
        
        <box
          borderStyle="single"
          borderColor="green"
          padding={1}
          flexGrow={1}
        >
          <box flexDirection="column">
            <text fg="green">Pageviews</text>
            <text><strong>{stats.pageviews.toLocaleString()}</strong></text>
          </box>
        </box>
        
        <box
          borderStyle="single"
          borderColor="yellow"
          padding={1}
          flexGrow={1}
        >
          <box flexDirection="column">
            <text fg="yellow">Bounce Rate</text>
            <text><strong>{(stats.bounceRate * 100).toFixed(1)}%</strong></text>
          </box>
        </box>
      </box>

      {/* Top Pages */}
      <box
        borderStyle="single"
        borderColor="cyan"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        <text fg="cyan"><strong>Top Pages</strong></text>
        <box height={1} />
        
        <box flexDirection="column" gap={1}>
          <box flexDirection="row">
            <text width={40}><strong>Path</strong></text>
            <text width={12}><strong>Visitors</strong></text>
            <text width={12}><strong>Pageviews</strong></text>
          </box>
          
          {topPages.slice(0, 5).map((page, i) => (
            <box key={i} flexDirection="row">
              <text width={40}>{page.path}</text>
              <text width={12}>{page.visitors}</text>
              <text width={12}>{page.pageviews}</text>
            </box>
          ))}
          
          {topPages.length === 0 && (
            <text fg="gray">No data yet</text>
          )}
        </box>
      </box>
    </box>
  );
}
