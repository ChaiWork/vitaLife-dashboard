/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  trend?: string;
  trendColor?: string;
  status?: {
    bg: string;
    emoji?: string;
    label: string;
    color: string;
  };
}

export function StatCard({ label, value, unit, trend, trendColor, status }: StatCardProps) {
  return (
    <div className="glass-panel p-8 rounded-[20px] transition-all hover:translate-y-[-2px]">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] uppercase font-bold text-minimal-muted tracking-widest">{label}</p>
          {status && (
            <div className={`px-2 py-0.5 rounded-full ${status.bg} border border-black/5 flex items-center gap-1.5`}>
              <span className="text-[10px] scale-75 leading-none">{status.emoji}</span>
              <span className={`text-[9px] font-extrabold uppercase tracking-tight ${status.color}`}>{status.label}</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <h4 className="text-4xl font-light tracking-tight text-minimal-ink">{value}</h4>
          <span className="text-base font-medium text-minimal-muted">{unit}</span>
        </div>
        {trend && <p className={`text-xs mt-3 font-medium text-minimal-muted text-${trendColor}`}>{trend}</p>}
      </div>
    </div>
  );
}
