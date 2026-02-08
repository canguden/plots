// Referrers view - traffic sources
import { useEffect, useState } from "react";
import type { ReferrersResponse } from "@plots/ui";
import { getReferrers } from "../api";
import type { TimeRange } from "../state";

interface Props {
  timeRange: TimeRange;
}

export function Referrers({ timeRange }: Props) {
  const [data, setData] = useState<ReferrersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReferrers(timeRange)
      .then(setData)
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) {
    return (
      <box flexGrow={1} justifyContent="center" alignItems="center">
        <text>Loading...</text>
      </box>
    );
  }

  if (!data) return null;

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box
        borderStyle="single"
        borderColor="magenta"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        <text fg="magenta"><strong>Referrers ({data.total})</strong></text>
        <box height={1} />
        
        <box flexDirection="column" gap={1}>
          <box flexDirection="row">
            <text width={50}><strong>Source</strong></text>
            <text width={12}><strong>Visitors</strong></text>
            <text width={12}><strong>Views</strong></text>
          </box>
          
          {data.referrers.map((ref, i) => (
            <box key={i} flexDirection="row">
              <text width={50}>{ref.domain || "Direct"}</text>
              <text width={12}>{ref.visitors}</text>
              <text width={12}>{ref.pageviews}</text>
            </box>
          ))}
          
          {data.referrers.length === 0 && (
            <text fg="gray">No referrer data yet</text>
          )}
        </box>
      </box>
    </box>
  );
}
