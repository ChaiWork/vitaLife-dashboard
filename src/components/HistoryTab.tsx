import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface HistoryItem {
  id: string;
  source: string;
  date: string;
  risk: string;
  summary: string;
  advice: string;
  heartRate: number | null;
}

interface HistoryTabProps {
  history: HistoryItem[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-6">Health Insight History</h3>
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-40 shrink-0">
              <p className="text-xs font-bold text-minimal-muted uppercase tracking-widest mb-1">{item.source}</p>
              <p className="text-sm font-semibold text-minimal-ink">{item.date}</p>
              <span className={`text-[10px] font-bold uppercase tracking-widest inline-block px-2 py-0.5 rounded mt-2 ${
                item.risk.toLowerCase().includes('high') || item.risk.toLowerCase().includes('critical') ? 'bg-red-50 text-red-600' :
                item.risk.toLowerCase().includes('moderate') || item.risk.toLowerCase().includes('medium') || item.risk.toLowerCase().includes('care') ? 'bg-amber-50 text-amber-600' : 
                'bg-emerald-50 text-emerald-600'
              }`}>
                {item.risk} Risk
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-minimal-ink">{item.summary}</h4>
                {item.heartRate && (
                  <span className="text-xs font-bold bg-minimal-bg px-2 py-1 rounded-lg border border-minimal-border">
                    {item.heartRate} BPM
                  </span>
                )}
              </div>
              <p className="text-sm text-minimal-muted leading-relaxed">{item.advice}</p>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="py-20 text-center text-zinc-500 italic flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-minimal-bg rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-minimal-muted" />
            </div>
            No historical health insights found.
          </div>
        )}
      </div>
    </motion.div>
  );
};
