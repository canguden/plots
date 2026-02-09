"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export function AnalyticsChart({ data, height = 200 }: Props) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>No data for this period</span>
      </div>
    );
  }

  // Detect granularity from data count
  // Check monthly FIRST — 12 months would also match the <= 25 hourly check
  const isMonthly = data.length >= 11 && data.length <= 13; // year = ~12 months
  const isHourly = !isMonthly && data.length <= 25; // today/yesterday = 24 hours

  const chartData = data.map(point => {
    const date = new Date(point.date);
    let label: string;

    if (isMonthly) {
      // Mon YYYY for year view
      label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (isHourly) {
      // HH:MM format for today/yesterday
      label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      // Mon DD for 7d/30d
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return {
      date: label,
      visitors: point.value,
    };
  });

  // Show fewer tick labels for dense data
  const tickInterval = data.length > 15 ? Math.floor(data.length / 8) : 0;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#666"
          style={{ fontSize: '11px' }}
          interval={tickInterval}
          tick={{ fill: '#666' }}
          axisLine={{ stroke: '#333' }}
        />
        <YAxis
          stroke="#666"
          style={{ fontSize: '11px' }}
          domain={[0, 'auto']}
          allowDataOverflow={false}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '6px',
            fontSize: '13px',
          }}
          labelStyle={{ color: '#fff', fontWeight: 600 }}
          itemStyle={{ color: '#999' }}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="#fff"
          strokeWidth={1.5}
          fill="url(#visitorGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#fff', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
