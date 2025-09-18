import React from 'react';

type Props = {
  levelPct: number; // 0-100
};

export const WaterTank: React.FC<Props> = ({ levelPct }) => {
  const clamped = Math.max(0, Math.min(100, levelPct));

  return (
    <div style={{
      background: '#0b1220',
      border: '1px solid #1f2937',
      borderRadius: 12,
      padding: 16,
      color: '#e5e7eb',
      width: '100%',
      height: 300,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>Water Tank</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 160,
          height: 240,
          borderRadius: 16,
          border: '3px solid #6b7280',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(31,41,55,0.6) 0%, rgba(31,41,55,0.9) 100%)'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${clamped}%`,
            background: 'linear-gradient(180deg, #22d3ee 0%, #0284c7 100%)',
            transition: 'height 0.6s ease'
          }} />
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.4)',
            padding: '4px 8px',
            borderRadius: 8,
            fontSize: 12,
            color: '#e5e7eb'
                        }}>{clamped.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
        Level indicates water in the tank
      </div>
    </div>
  );
};