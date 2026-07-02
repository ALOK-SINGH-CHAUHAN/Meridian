"use client";

import React from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface SparklineProps {
  data: { value: number }[];
  metric: 'employees' | 'active' | 'overdue' | 'rate';
}

export default function Sparkline({ data, metric }: SparklineProps) {
  const strokeColor = metric === 'employees' 
    ? '#2563eb' 
    : metric === 'active' 
    ? '#ea580c' 
    : metric === 'overdue' 
    ? '#dc2626' 
    : '#16a34a';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={strokeColor} 
          strokeWidth={1.5} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
