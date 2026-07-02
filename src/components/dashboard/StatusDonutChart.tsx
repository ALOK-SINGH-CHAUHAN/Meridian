"use client";

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatusDonutChartProps {
  donutData: { name: string; value: number; color: string; bg?: string }[];
  totalTasks: number;
  activePieIndex: number | null;
  onPieEnter: (index: number) => void;
  onPieLeave: () => void;
}

export default function StatusDonutChart({
  donutData,
  totalTasks,
  activePieIndex,
  onPieEnter,
  onPieLeave
}: StatusDonutChartProps) {

  if (donutData.length === 0) {
    return <span className="text-[12px] text-text-graphite">No active scopes found.</span>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--card)', 
            borderColor: 'var(--hairline)', 
            borderRadius: '12px', 
            fontSize: '12px', 
            color: 'var(--text-primary)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
          }}
          formatter={(value: any, name: any) => {
            const percent = totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
            return [`${value} Tasks (${percent}%)`, name];
          }}
        />
        <Pie
          data={donutData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={85}
          paddingAngle={4}
          dataKey="value"
          onMouseEnter={(_, index) => onPieEnter(index)}
          onMouseLeave={() => onPieLeave()}
        >
          {donutData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.55}
              style={{ 
                transform: activePieIndex === index ? 'scale(1.03)' : 'scale(1)', 
                transformOrigin: 'center', 
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer'
              }}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
