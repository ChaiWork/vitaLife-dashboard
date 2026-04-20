/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { History, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HistoryTabProps {
  unifiedHistory: any[];
}

export function HistoryTab({ unifiedHistory }: HistoryTabProps) {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-minimal-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-minimal-ink flex items-center gap-2">
            <History size={24} className="text-minimal-blue" />
            Complete Risk History
          </h2>
          <p className="text-xs text-minimal-muted">Timeline of your AI-generated health insights and standard assessments</p>
        </div>
      </div>

      <div className="space-y-4">
        {unifiedHistory.length > 0 ? unifiedHistory.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-3xl border border-minimal-border hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  item.risk.toLowerCase().includes('high') ? 'bg-red-50 text-red-500' :
                  item.risk.toLowerCase().includes('moderate') ? 'bg-amber-50 text-amber-500' :
                  'bg-emerald-50 text-emerald-500'
                }`}>
                  {item.risk.toLowerCase().includes('low') ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-minimal-muted">{item.date}</span>
                    <span className="w-1 h-1 bg-minimal-border rounded-full" />
                    <span className="text-[10px] font-bold text-minimal-blue uppercase tracking-tight">{item.source}</span>
                  </div>
                  <h4 className="text-sm font-bold text-minimal-ink mb-1">{item.risk} Risk Profile</h4>
                  <p className="text-xs text-minimal-muted leading-relaxed max-w-2xl">{item.summary}</p>
                </div>
              </div>
              <div className="bg-minimal-bg px-4 py-3 rounded-2xl min-w-[200px]">
                <p className="text-[9px] uppercase font-bold text-minimal-muted mb-1">Recommended Action</p>
                <p className="text-[11px] font-medium text-minimal-ink italic">"{item.advice}"</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center glass-panel rounded-[40px]">
            <History size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-minimal-muted text-sm italic">No history available yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
