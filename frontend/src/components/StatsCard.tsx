import React, { memo, useMemo } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  gradient: string;
}

const StatsCard = memo<StatsCardProps>(({ title, value, subtitle, icon, gradient }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #334155)',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '25px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.2s ease-in-out'
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '4px',
        height: '100%',
        background: gradient
      }}></div>
      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '10px' }}>
        {icon} {title}
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: gradient.includes('3b82f6') ? '#60a5fa' :
               gradient.includes('10b981') ? '#10b981' :
               gradient.includes('8b5cf6') ? '#8b5cf6' : '#f59e0b',
        marginBottom: '5px',
        textShadow: `0 0 10px ${gradient.includes('3b82f6') ? 'rgba(96, 165, 250, 0.5)' :
                            gradient.includes('10b981') ? 'rgba(16, 185, 129, 0.5)' :
                            gradient.includes('8b5cf6') ? 'rgba(139, 92, 246, 0.5)' :
                            'rgba(245, 158, 11, 0.5)'}`
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        {subtitle}
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;