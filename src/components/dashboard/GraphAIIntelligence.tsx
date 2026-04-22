import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateGraphAnalysis, GraphAnalysisResponse } from '../../services/geminiService';

interface GraphAIIntelligenceProps {
  view: 'daily' | 'weekly' | 'monthly';
  data: any[];
  metric: string;
  bmiData?: any[];
}

export const GraphAIIntelligence: React.FC<GraphAIIntelligenceProps> = ({ view, data, metric, bmiData }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<GraphAnalysisResponse | null>(null);

  const runDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await generateGraphAnalysis({ view, data, metric, bmiData });
      setAiResponse(response);
    } catch (error) {
      console.error('Graph analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    setAiResponse(null);
  }, [view, metric]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-rose-500" />;
      case 'down': return <TrendingDown size={14} className="text-emerald-500" />;
      default: return <Minus size={14} className="text-minimal-muted" />;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-[32px] mt-6 relative overflow-hidden group">
      <div className="absolute -right-12 -top-12 p-8 text-minimal-blue/5 group-hover:text-minimal-blue/10 transition-colors">
        <Brain size={160} />
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-minimal-blue/10 text-minimal-blue rounded-2xl ring-1 ring-minimal-blue/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-minimal-ink tracking-tight flex items-center gap-2">
              Graph AI Intelligence 
              <span className="px-2 py-0.5 bg-minimal-blue/5 text-[10px] font-black uppercase tracking-widest text-minimal-blue rounded-full border border-minimal-blue/10">
                {view}
              </span>
            </h3>
            <p className="text-[10px] font-bold text-minimal-muted/60 uppercase tracking-[0.15em]">Longitudinal Pattern Analysis</p>
          </div>
        </div>
        {!aiResponse && !isAnalyzing && (
          <button 
            onClick={runDeepAnalysis}
            className="px-4 py-2 bg-minimal-ink text-white dark:bg-vital-400 dark:text-minimal-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-minimal-ink/20"
          >
            Compute Trends
          </button>
        )}
      </div>

      <div className="relative z-10 h-auto min-h-32 flex flex-col justify-center">
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3 justify-center py-8">
            <div className="w-8 h-8 border-3 border-minimal-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-minimal-blue animate-pulse uppercase tracking-widest">Scanning Metadata Streams...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {aiResponse ? (
              <motion.div 
                key="insight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-minimal-blue">
                      <Brain size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Intelligence Insights</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-minimal-ink/90 italic">"{aiResponse.summary}"</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                    <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
                      <span className="text-[10px] font-black text-minimal-muted/60 uppercase">Stability</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{aiResponse.stability.toFixed(1)}%</span>
                    </div>
                    {aiResponse.trends.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
                        <span className="text-[10px] font-black text-minimal-muted/60 uppercase">{t.label}</span>
                        <div className="flex items-center gap-1.5">
                          {getTrendIcon(t.trend)}
                          <span className={`text-[11px] font-bold ${t.trend === 'up' ? 'text-rose-500' : (t.trend === 'down' ? 'text-emerald-500 dark:text-emerald-400' : 'text-minimal-muted')}`}>
                            {t.change > 0 ? '+' : ''}{t.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-minimal-muted/40 uppercase tracking-widest">Intelligence Confidence Matrix</span>
                    <span className="text-[10px] font-black text-minimal-blue uppercase tracking-widest">Target achieved</span>
                  </div>
                  <div className="flex gap-2">
                    {[20, 40, 60, 80, 100].map(val => (
                      <div key={val} className="flex-1 space-y-1.5">
                        <div className="h-1 rounded-full bg-minimal-bg overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: val <= aiResponse.stability ? '100%' : '15%' }}
                            className={`h-full ${val <= aiResponse.stability ? 'bg-minimal-blue' : 'bg-minimal-bg'}`}
                          />
                        </div>
                        <p className="text-[8px] font-black text-minimal-muted/40 text-center">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-4"
              >
                <div className="inline-flex items-center gap-2 p-2 px-4 bg-minimal-bg/50 border border-dashed border-minimal-border rounded-xl shadow-inner-sm">
                  <Brain size={14} className="text-minimal-muted" />
                  <p className="text-[11px] font-medium text-minimal-muted italic">Click Compute Trends for deep metric analysis.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
