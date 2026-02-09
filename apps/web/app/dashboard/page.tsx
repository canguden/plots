"use client";

import { getOverview, getPages, getReferrers, getCountries, getDevices } from "../../lib/api-client";
import { DashboardClient } from "../../components/DashboardClient";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-[#666]">Loading dashboard...</p>
          </div>
        </div>
      ) : data ? (
        <DashboardClient
          initialData={data}
          initialRange="7d"
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[#666]">Failed to load dashboard</p>
        </div>
      )}
    </ProtectedRoute>
  );
}
