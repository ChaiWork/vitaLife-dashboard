import React from 'react';
import { motion } from 'motion/react';
import { ECGHeartbeat } from '../common/ECGHeartbeat';

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  showECG?: boolean;
  pulseColor?: string;
  status?: {
    level: string;
    color: string;
    emoji?: string;
    label?: string;
    bg?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, status, icon, showECG, pulseColor }) => {
  const isDanger = status?.color?.includes('red') || status?.level?.toLowerCase() === 'critical';
  const isWarning = status?.color?.includes('orange') || status?.color?.includes('yellow') || status?.level?.toLowerCase() === 'high';

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      className={`glass-panel p-6 rounded-[32px] transition-all relative overflow-hidden group
        ${isDanger ? 'ai-pulse-danger' : isWarning ? 'ai-pulse-warning' : ''}
        ${status?.bg || ''}`}
    >
      {/* Background Soft Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-10 transition-colors
        ${isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-minimal-blue'}`} 
      />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={`p-2 rounded-xl backdrop-blur-md bg-white/40 ring-1 ring-white/20
              ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-minimal-blue'}`}>
              {icon}
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-minimal-muted/80">{label}</p>
        </div>
        {status?.emoji && (
          <span className="text-sm backdrop-blur-md bg-white/60 w-8 h-8 flex items-center justify-center rounded-xl shadow-glass border border-white/40">
            {status.emoji}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-4xl font-display font-semibold tracking-tight text-minimal-ink">{value}</h3>
          <span className="text-[10px] font-bold text-minimal-muted/60 uppercase tracking-widest translate-y-[-2px]">{unit}</span>
        </div>
        
        {showECG && <ECGHeartbeat color={pulseColor || (isDanger ? '#ef4444' : '#7EA0EA')} className="translate-y-[-8px] opacity-80" />}
      </div>

      {status && (
        <div className={`mt-5 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 px-3 py-1.5 rounded-full w-fit backdrop-blur-md border border-white/20
          ${isDanger ? 'bg-red-500/10 text-red-600' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${isDanger || isWarning ? 'animate-pulse' : ''}`} />
          {status.label || status.level}
        </div>
      )}
    </motion.div>
  );
};
