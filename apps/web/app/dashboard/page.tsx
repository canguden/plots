import { getOverview, getPages, getReferrers, getCountries, getDevices } from "../../lib/api";
import { DashboardClient } from "../../components/DashboardClient";

interface Props {
  searchParams: Promise<{ range?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const range = params.range || "7d";
  
  // Fetch all data in parallel for initial render
  const [overview, pages, referrers, countries, devices] = await Promise.all([
    getOverview(range),
    getPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range),
  ]);

  return (
    <DashboardClient
      initialData={{ overview, pages, referrers, countries, devices }}
      initialRange={range}
    />
  );
}
