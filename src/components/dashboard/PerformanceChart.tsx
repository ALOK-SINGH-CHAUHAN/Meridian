"use client";

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PerformanceChartProps {
  chartType: 'line' | 'bar';
  activeAnalytics: 'completions' | 'productivity';
  chartData: any[];
  hiddenDepts: Record<string, boolean>;
}

export default function PerformanceChart({
  chartType,
  activeAnalytics,
  chartData,
  hiddenDepts
}: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'line' ? (
        <LineChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--hairline)" opacity={0.2} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--hairline)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
          
          {activeAnalytics === 'completions' ? (
            <>
              {!hiddenDepts['Engineering'] && <Line type="monotone" dataKey="Engineering" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#2563eb' }} />}
              {!hiddenDepts['Product'] && <Line type="monotone" dataKey="Product" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#16a34a' }} />}
              {!hiddenDepts['Security'] && <Line type="monotone" dataKey="Security" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#ea580c' }} />}
              {!hiddenDepts['Operations'] && <Line type="monotone" dataKey="Operations" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#9333ea' }} />}
            </>
          ) : (
            <Line type="monotone" dataKey="Productivity" stroke="var(--blue-acc)" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: 'var(--blue-acc)' }} />
          )}
        </LineChart>
      ) : (
        <BarChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--hairline)" opacity={0.2} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--hairline)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
          
          {activeAnalytics === 'completions' ? (
            <>
              {!hiddenDepts['Engineering'] && <Bar dataKey="Engineering" fill="#2563eb" radius={[4, 4, 0, 0]} />}
              {!hiddenDepts['Product'] && <Bar dataKey="Product" fill="#16a34a" radius={[4, 4, 0, 0]} />}
              {!hiddenDepts['Security'] && <Bar dataKey="Security" fill="#ea580c" radius={[4, 4, 0, 0]} />}
              {!hiddenDepts['Operations'] && <Bar dataKey="Operations" fill="#9333ea" radius={[4, 4, 0, 0]} />}
            </>
          ) : (
            <Bar dataKey="Productivity" fill="var(--blue-acc)" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
