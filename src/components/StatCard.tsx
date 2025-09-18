import React from 'react';

type Props = {
  label: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  valueColor?: string;
};

export const StatCard: React.FC<Props> = ({ label, value, subtitle, valueColor }) => {
  return (
    <div style={{
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: 12,
      padding: 20,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      color: '#1e293b',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div style={{ 
        fontSize: 13, 
        color: '#64748b', 
        marginBottom: 8,
        fontWeight: 500
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 28, 
        fontWeight: 700,
        color: valueColor || '#1e293b',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: 12, 
          color: '#94a3b8', 
          marginTop: 8,
          fontWeight: 500
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};