import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export type SeriesPoint = { t: number; v: number };

type Props = {
  data: SeriesPoint[];
  color: string;
  label: string;
  unit?: string;
  yDomain?: [number, number];
};

export const TimeSeriesChart: React.FC<Props> = ({ data, color, label, unit, yDomain }) => {
  const formatted = data.map(p => ({
    time: new Date(p.t).toLocaleTimeString(),
    value: Number(p.v.toFixed(2)), // Ensure 2 decimal places
  }));

  // Auto-detect if this is a percentage chart and set domain accordingly
  const isPercentage = label.toLowerCase().includes('%') || label.toLowerCase().includes('percent');
  const defaultYDomain = isPercentage ? [0, 100] : yDomain;

  return (
    <div style={{ 
      width: '100%', 
      height: 280, 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      border: '1px solid rgba(148, 163, 184, 0.2)', 
      borderRadius: 16, 
      padding: 20,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        color: '#1e293b', 
        fontWeight: 600, 
        marginBottom: 16,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📈 {label}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 12, right: 12, left: 8, bottom: 25 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            minTickGap={32}
            fontSize={10}
            tick={{ fill: '#475569' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#64748b" 
            domain={defaultYDomain} 
            tickFormatter={(v) => `${v}${unit ?? ''}`}
            fontSize={11}
            tick={{ fill: '#475569' }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid rgba(148, 163, 184, 0.2)', 
              color: '#1e293b',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            labelStyle={{ color: '#64748b' }}
            formatter={(v: any) => [`${Number(v).toFixed(2)}${unit ?? ''}`, label]} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3} 
            dot={false} 
            isAnimationActive={false}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};