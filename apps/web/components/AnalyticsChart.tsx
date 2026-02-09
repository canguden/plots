"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export function AnalyticsChart({ data, height = 200 }: Props) {
  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    visitors: point.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis
          dataKey="date"
          stroke="#666"
          style={{ fontSize: '12px' }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          stroke="#666"
          style={{ fontSize: '12px' }}
          domain={[0, 'auto']}
          allowDataOverflow={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '4px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Line
          type="monotone"
          dataKey="visitors"
          stroke="#fff"
          strokeWidth={2}
          dot={{ fill: '#000', stroke: '#fff', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
