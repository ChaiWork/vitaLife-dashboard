import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  status?: {
    level: string;
    color: string;
    emoji?: string;
    label?: string;
    bg?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, status }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`glass-panel p-6 rounded-3xl transition-all ${status?.bg || ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted opacity-80">{label}</p>
        {status?.emoji && (
          <span className="text-sm bg-white/50 w-6 h-6 flex items-center justify-center rounded-lg shadow-sm">
            {status.emoji}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold tracking-tight text-minimal-ink">{value}</h3>
        <span className="text-xs font-medium text-minimal-muted">{unit}</span>
      </div>
      {status && (
        <div className={`mt-3 text-[10px] whitespace-nowrap font-bold uppercase tracking-widest flex items-center gap-1.5 ${status.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
          {status.label || status.level}
        </div>
      )}
    </motion.div>
  );
};
