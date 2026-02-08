// Devices view - device and browser breakdown
import { useEffect, useState } from "react";
import type { DevicesResponse } from "@plots/ui";
import { getDevices } from "../api";
import type { TimeRange } from "../state";

interface Props {
  timeRange: TimeRange;
}

export function Devices({ timeRange }: Props) {
  const [data, setData] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDevices(timeRange)
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
    <box flexDirection="column" flexGrow={1} padding={1} gap={1}>
      <box
        borderStyle="single"
        borderColor="blue"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        <text fg="blue"><strong>Devices</strong></text>
        <box height={1} />
        
        <box flexDirection="column" gap={1}>
          <box flexDirection="row">
            <text width={20}><strong>Device</strong></text>
            <text width={12}><strong>Visitors</strong></text>
            <text width={12}><strong>%</strong></text>
          </box>
          
          {data.devices.map((device, i) => (
            <box key={i} flexDirection="row">
              <text width={20}>{device.device}</text>
              <text width={12}>{device.visitors}</text>
              <text width={12}>{device.percentage.toFixed(1)}%</text>
            </box>
          ))}
        </box>
      </box>

      <box
        borderStyle="single"
        borderColor="cyan"
        padding={1}
        flexDirection="column"
        flexGrow={1}
      >
        <text fg="cyan"><strong>Browsers</strong></text>
        <box height={1} />
        
        <box flexDirection="column" gap={1}>
          <box flexDirection="row">
            <text width={20}><strong>Browser</strong></text>
            <text width={12}><strong>Visitors</strong></text>
            <text width={12}><strong>%</strong></text>
          </box>
          
          {data.browsers.map((browser, i) => (
            <box key={i} flexDirection="row">
              <text width={20}>{browser.browser}</text>
              <text width={12}>{browser.visitors}</text>
              <text width={12}>{browser.percentage.toFixed(1)}%</text>
            </box>
          ))}
        </box>
      </box>
    </box>
  );
}
