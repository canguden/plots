// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="border border-[#222] bg-red-500 rounded-lg p-4 hover:border-[#333] transition-colors">
      <div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">{title}</div>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      {subtitle && <div className="text-xs text-[#666] mt-1">{subtitle}</div>}
    </div>
  );
}
