// Minimal global state for CLI
import { useState } from "react";

export type TimeRange = "today" | "yesterday" | "7d" | "30d";
export type View = "overview" | "pages" | "referrers" | "countries" | "devices" | "events";

export function useAppState() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [currentView, setCurrentView] = useState<View>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    timeRange,
    setTimeRange,
    currentView,
    setCurrentView,
    isLoading,
    setIsLoading,
    error,
    setError,
  };
}
