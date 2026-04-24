import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ChevronLeft, ChevronRight, Activity, Heart, Zap, Trash2, Droplets } from 'lucide-react';

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
  onDelete: (id: string, source: string) => void;
}

const ITEMS_PER_PAGE = 5;

export const HistoryTab: React.FC<HistoryTabProps> = ({ history, onDelete }) => {
  const [filter, setFilter] = React.useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredHistory = React.useMemo(() => {
    let result = history;
    if (filter !== 'all') {
      result = history.filter(item => item.risk.toLowerCase().includes(filter));
    }
    return result;
  }, [history, filter]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Heart AI': return <Heart size={16} className="text-rose-500" />;
      case 'Metabolic Insight': return <Droplets size={16} className="text-minimal-blue" />;
      case 'Chronic Analysis': return <Zap size={16} className="text-amber-500" />;
      default: return <Activity size={16} className="text-minimal-muted" />;
    }
  };

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
                  : 'bg-minimal-white text-minimal-muted border-minimal-border hover:border-minimal-muted'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {paginatedHistory.map((item) => {
          const isDanger = item.risk.toLowerCase().includes('critical') || item.risk.toLowerCase().includes('danger') || item.risk.toLowerCase().includes('unknown');
          const isHigh = item.risk.toLowerCase().includes('high');
          const isModerate = item.risk.toLowerCase().includes('moderate') || item.risk.toLowerCase().includes('medium');
          
          return (
            <div key={item.id} className={`p-6 rounded-[32px] flex flex-col md:flex-row gap-6 items-start border shadow-sm transition-all group relative overflow-hidden ${
              isDanger ? 'bg-rose-50/50 border-rose-100 hover:bg-rose-50' :
              isHigh ? 'bg-red-50/50 border-red-100 hover:bg-red-50' :
              isModerate ? 'bg-amber-50/50 border-amber-100 hover:bg-amber-50' :
              'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
            }`}>
              <div className="md:w-40 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${
                    isDanger ? 'bg-rose-100 text-rose-600' : 
                    isHigh ? 'bg-red-100 text-red-600' : 
                    isModerate ? 'bg-amber-100 text-amber-600' : 
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {getSourceIcon(item.source)}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    isDanger ? 'text-rose-700/60' : isHigh ? 'text-red-700/60' : isModerate ? 'text-amber-700/60' : 'text-emerald-700/60'
                  }`}>{item.source}</p>
                </div>
                <p className="text-sm font-semibold text-minimal-ink">
                  {item.date}
                </p>
                <span className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded-lg mt-2 border ${
                  isDanger ? 'bg-rose-600 text-white border-rose-600 shadow-sm' :
                  isHigh ? 'bg-red-500/10 text-red-700 border-red-200' :
                  isModerate ? 'bg-amber-500/10 text-amber-700 border-amber-200' : 
                  'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                }`}>
                  {isDanger ? 'Danger' : 
                  item.risk.toLowerCase().includes('unknown') ? 'Unknown Risk' : 
                  item.risk} {(!item.risk.toLowerCase().includes('risk') && !item.risk.toLowerCase().includes('unknown')) && 'Risk'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h4 className="font-bold text-minimal-ink leading-snug">{item.summary}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.heartRate && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${
                        isDanger ? 'bg-rose-100 border-rose-200 text-rose-800' :
                        isHigh ? 'bg-red-100 border-red-200 text-red-800' :
                        isModerate ? 'bg-amber-100 border-amber-200 text-amber-800' :
                        'bg-emerald-100 border-emerald-200 text-emerald-800'
                      }`}>
                        {item.heartRate} BPM
                      </span>
                    )}
                    <button 
                      onClick={() => onDelete(item.id, item.source)}
                      className="p-2 text-minimal-muted hover:text-rose-500 hover:bg-rose-100/50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={`text-sm font-medium leading-relaxed ${
                  isDanger ? 'text-rose-950/70' : isHigh ? 'text-red-950/70' : isModerate ? 'text-amber-950/70' : 'text-emerald-950/70'
                }`}>{item.advice}</p>
              </div>
            </div>
          );
        })}
        {history.length === 0 && (
          <div className="py-20 text-center text-minimal-muted/60 italic flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-minimal-bg rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-minimal-muted" />
            </div>
            No historical health insights found.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border border-minimal-border rounded-xl text-minimal-muted hover:bg-minimal-bg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <div className="rotate-0"><ChevronLeft size={20} /></div>
            </button>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-minimal-muted">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 border border-minimal-border rounded-xl text-minimal-muted hover:bg-minimal-bg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
