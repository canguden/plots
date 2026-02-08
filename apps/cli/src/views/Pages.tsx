// Pages view - detailed page analytics
import { useEffect, useState } from "react";
import type { PagesResponse } from "@plots/ui";
import { getPages } from "../api";
import type { TimeRange } from "../state";

interface Props {
  timeRange: TimeRange;
}

export function Pages({ timeRange }: Props) {
  const [data, setData] = useState<PagesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPages(timeRange)
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
        borderColor="cyan"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        <text fg="cyan"><strong>All Pages ({data.total})</strong></text>
        <box height={1} />
        
        <box flexDirection="column" gap={1}>
          <box flexDirection="row">
            <text width={50}><strong>Path</strong></text>
            <text width={12}><strong>Visitors</strong></text>
            <text width={12}><strong>Views</strong></text>
          </box>
          
          {data.pages.map((page, i) => (
            <box key={i} flexDirection="row">
              <text width={50}>{page.path}</text>
              <text width={12}>{page.visitors}</text>
              <text width={12}>{page.pageviews}</text>
            </box>
          ))}
          
          {data.pages.length === 0 && (
            <text fg="gray">No pages tracked yet</text>
          )}
        </box>
      </box>
    </box>
  );
}
