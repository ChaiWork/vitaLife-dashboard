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
  const [filter, setFilter] = React.useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('all');

  const filteredHistory = React.useMemo(() => {
    if (filter === 'all') return history;
    return history.filter(item => item.risk.toLowerCase().includes(filter));
  }, [history, filter]);

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold">Health Insight History</h3>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {(['all', 'low', 'moderate', 'high', 'danger'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level === 'danger' ? 'critical' : level)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                (level === 'danger' ? filter === 'critical' : filter === level)
                  ? 'bg-minimal-ink text-white border-minimal-ink'
                  : 'bg-white text-minimal-muted border-minimal-border hover:border-minimal-muted'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-40 shrink-0">
              <p className="text-xs font-bold text-minimal-muted uppercase tracking-widest mb-1">{item.source}</p>
              <p className="text-sm font-semibold text-minimal-ink">{item.date}</p>
              <span className={`text-[10px] font-bold uppercase tracking-widest inline-block px-2 py-0.5 rounded mt-2 ${
                item.risk.toLowerCase().includes('high') ? 'bg-red-50 text-red-600' :
                item.risk.toLowerCase().includes('critical') || item.risk.toLowerCase().includes('danger') ? 'bg-red-600 text-white' :
                item.risk.toLowerCase().includes('moderate') || item.risk.toLowerCase().includes('medium') ? 'bg-amber-50 text-amber-600' : 
                'bg-emerald-50 text-emerald-600'
              }`}>
                {item.risk.toLowerCase().includes('critical') ? 'Danger' : item.risk} Risk
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
