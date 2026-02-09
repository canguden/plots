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
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch projects first
  useEffect(() => {
    if (!user) return;

    async function fetchProjects() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.plots.sh';
        const res = await fetch(`${apiUrl}/api/projects`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          const projectsData = await res.json();
          setProjects(projectsData || []);
          
          // If no projects, redirect to onboarding
          if (!projectsData || projectsData.length === 0) {
            router.push('/onboarding');
            return;
          }
          
          // Select first project by default
          setSelectedProject(projectsData[0].id);
        }
      } catch (err: any) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects");
      }
    }
    
    fetchProjects();
  }, [user, router]);

  // Fetch dashboard data once we have a project
  useEffect(() => {
    if (!user || !selectedProject) return;

    async function fetchData() {
      try {
        const range = "7d";
        const [overview, pages, referrers, countries, devices] = await Promise.all([
          getOverview(range, selectedProject || undefined),
          getPages(range, selectedProject || undefined),
          getReferrers(range, selectedProject || undefined),
          getCountries(range, selectedProject || undefined),
          getDevices(range, selectedProject || undefined),
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
  }, [user, selectedProject]);

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
