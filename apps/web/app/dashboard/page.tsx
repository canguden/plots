"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { getOverview, getPages, getReferrers, getCountries, getDevices } from "../../lib/api-client";
import { DashboardClient } from "../../components/DashboardClient";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch dashboard data once authenticated
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const range = "7d";
        const [overview, pages, referrers, countries, devices] = await Promise.all([
          getOverview(range),
          getPages(range),
          getReferrers(range),
          getCountries(range),
          getDevices(range),
        ]);
        
        setData({ overview, pages, referrers, countries, devices });
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setDataLoading(false);
      }
    }
    
    fetchData();
  }, [user]);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  // Data loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#fb2c36] mb-4">{error || "Failed to load dashboard"}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm bg-white text-black px-4 py-2 rounded font-medium hover:bg-[#eee] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      initialData={data}
      initialRange="7d"
    />
  );
}
