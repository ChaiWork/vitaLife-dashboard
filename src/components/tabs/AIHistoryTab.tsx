import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trash2, ChevronLeft, ChevronRight, BarChart2, Calendar, Target, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GraphAIHistory } from '../../types';

interface AIHistoryTabProps {
  history: GraphAIHistory[];
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 5;

export const AIHistoryTab: React.FC<AIHistoryTabProps> = ({ history, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} className="text-rose-500" />;
      case 'down': return <TrendingDown size={12} className="text-emerald-500" />;
      default: return <Minus size={12} className="text-minimal-muted" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '--';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + d.toLocaleDateString();
  };

  return (
    <motion.div
      key="aiHistory"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-minimal-ink">Graph Intelligence Records</h3>
          <p className="text-xs text-minimal-muted font-bold uppercase tracking-widest mt-1">Snapshot of longitudinal intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-minimal-blue/10 text-minimal-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-minimal-blue/20">
            {history.length} Logs
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {paginatedHistory.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass-panel p-6 rounded-[32px] border border-minimal-border group relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                <div className="shrink-0 space-y-3 lg:w-48">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-minimal-blue/5 text-minimal-blue rounded-xl">
                      <BarChart2 size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-minimal-blue">{item.metric}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-minimal-ink">{item.view.toUpperCase()} RANGE</p>
                    <div className="flex items-center gap-1.5 text-minimal-muted">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-minimal-border/50">
                    <Target size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Stability: {item.stability}%</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-minimal-blue/60">
                      <Brain size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Logic Summary</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-minimal-ink italic">"{item.summary}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-minimal-bg/30 p-4 rounded-2xl border border-minimal-border/40">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-rose-500/80">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">A.I. Prediction</span>
                      </div>
                      <p className="text-xs font-bold text-minimal-ink">{item.prediction}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600/80">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Prescriptive Advice</span>
                      </div>
                      <p className="text-[11px] font-medium text-minimal-muted leading-relaxed">{item.advice}</p>
                    </div>
                  </div>

                  {item.trends && item.trends.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.trends.map((t, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-white/40 dark:bg-white/5 border border-white/50 rounded-xl flex items-center gap-2">
                          <span className="text-[9px] font-bold text-minimal-muted uppercase tracking-wider">{t.label}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(t.trend)}
                            <span className={`text-[10px] font-bold ${t.trend === 'up' ? 'text-rose-600' : (t.trend === 'down' ? 'text-emerald-600' : 'text-minimal-muted')}`}>
                              {t.change > 0 ? '+' : ''}{t.change}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:min-w-[40px] flex items-start justify-end">
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-3 text-minimal-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group-hover:bg-red-50/50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {history.length === 0 && (
          <div className="py-20 text-center glass-panel rounded-[32px]">
            <Brain size={48} className="mx-auto text-minimal-muted/20 mb-4" />
            <p className="text-minimal-muted font-medium italic">No graph analysis logic recorded yet.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border border-minimal-border rounded-xl text-minimal-muted hover:bg-minimal-bg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
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
