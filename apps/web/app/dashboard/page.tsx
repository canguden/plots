import { getOverview, getPages, getReferrers, getCountries, getDevices } from "../lib/api";
import { TimeRangeSelector } from "../components/TimeRangeSelector";

interface Props {
  searchParams: Promise<{ range?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const range = params.range || "7d";
  
  // Fetch all data in parallel
  const [overview, pages, referrers, countries, devices] = await Promise.all([
    getOverview(range),
    getPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range),
  ]);

  // Calculate max value for chart scaling
  const maxValue = Math.max(...overview.series.map(s => s.value), 1);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#666]">Tracking</div>
          <div className="text-sm text-white font-semibold">proj_demo</div>
        </div>
        <TimeRangeSelector />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Visitors</div>
          <div className="text-2xl font-bold text-white tabular-nums">{overview.stats.visitors.toLocaleString()}</div>
        </div>
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Pageviews</div>
          <div className="text-2xl font-bold text-white tabular-nums">{overview.stats.pageviews.toLocaleString()}</div>
        </div>
        <div className="border border-[#222] bg-[#111] rounded-lg p-4 hover:border-[#333] transition-colors">
          <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">Bounce Rate</div>
          <div className="text-2xl font-bold text-white tabular-nums">{`${(overview.stats.bounceRate * 100).toFixed(1)}%`}</div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="border border-[#222] bg-[#111] rounded-lg p-6">
        <div className="flex items-end justify-between h-24 gap-1">
          {overview.series.map((point, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-white/80 rounded-sm transition-all hover:bg-white"
                style={{ 
                  height: `${(point.value / maxValue) * 100}%`,
                  minHeight: point.value > 0 ? '4px' : '0'
                }}
              />
              <div className="text-[10px] text-[#666] whitespace-nowrap">
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Top Pages</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {pages.pages.slice(0, 5).map((page, i) => (
              <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                <div className="text-sm text-white truncate flex-1">{page.path}</div>
                <div className="text-sm text-[#666] tabular-nums ml-4">{page.visitors}</div>
              </div>
            ))}
            {pages.pages.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Top Referrers</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {referrers.referrers.slice(0, 5).map((ref, i) => (
              <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                <div className="text-sm text-white truncate flex-1">{ref.domain || "Direct"}</div>
                <div className="text-sm text-[#666] tabular-nums ml-4">{ref.visitors}</div>
              </div>
            ))}
            {referrers.referrers.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>

        {/* Countries */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Countries</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {countries.countries.slice(0, 5).map((country, i) => (
              <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between">
                <div className="text-sm text-white truncate flex-1">{country.country}</div>
                <div className="text-sm text-[#666] tabular-nums ml-4">{country.percentage.toFixed(0)}%</div>
              </div>
            ))}
            {countries.countries.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="border border-[#222] bg-[#111] rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-[#222]">
            <h2 className="text-sm font-semibold text-white">Devices</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {devices.devices.slice(0, 5).map((device, i) => {
              const deviceLower = device.device.toLowerCase();
              let icon = '';
              
              if (deviceLower.includes('mac') || deviceLower.includes('ios')) {
                icon = ' ▄▄▄\n█   █\n█▄▄▄█';
              } else if (deviceLower.includes('windows') || deviceLower.includes('pc')) {
                icon = '█ █\n█▄█\n█ █';
              } else if (deviceLower.includes('linux')) {
                icon = ' ▄█▄\n█▀▀▀\n ▀▀▀';
              } else if (deviceLower.includes('android')) {
                icon = ' ▄ ▄\n█▀▀█\n█▄▄█';
              } else {
                icon = '▄█▄\n█▀█\n▀▀▀';
              }
              
              return (
                <div key={i} className="px-6 py-3 hover:bg-[#1a1a1a] transition-colors flex items-center gap-4">
                  <pre className="text-[10px] leading-[1.1] text-[#666] whitespace-pre">
{icon}
                  </pre>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="text-sm text-white truncate flex-1">{device.device}</div>
                    <div className="text-sm text-[#666] tabular-nums ml-4">{device.percentage.toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
            {devices.devices.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-[#666]">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
