// Countries view - geographic distribution
import { useEffect, useState } from "react";
import type { CountriesResponse } from "@plots/ui";
import { getCountries } from "../api";
import type { TimeRange } from "../state";

interface Props {
  timeRange: TimeRange;
}

export function Countries({ timeRange }: Props) {
  const [data, setData] = useState<CountriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCountries(timeRange)
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
        borderColor="green"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        <text fg="green"><strong>Countries ({data.total})</strong></text>
        <box height={1} />
        
        <box flexDirection="column" gap={1}>
          <box flexDirection="row">
            <text width={30}><strong>Country</strong></text>
            <text width={12}><strong>Visitors</strong></text>
            <text width={12}><strong>Percentage</strong></text>
          </box>
          
          {data.countries.map((country, i) => (
            <box key={i} flexDirection="row">
              <text width={30}>{country.country}</text>
              <text width={12}>{country.visitors}</text>
              <text width={12}>{country.percentage.toFixed(1)}%</text>
            </box>
          ))}
          
          {data.countries.length === 0 && (
            <text fg="gray">No country data yet</text>
          )}
        </box>
      </box>
    </box>
  );
}
