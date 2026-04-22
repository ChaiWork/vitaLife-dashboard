import React from 'react';
import { Stethoscope, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AIRiskHighlightProps {
  latestRisk: string;
  summary: string;
  advice: string;
  isAnalyzing: boolean;
  needsSync?: boolean;
  lastSyncTime?: Date | null;
  onRefresh?: () => void;
  onFindClinic: () => void;
}

export const AIRiskHighlight: React.FC<AIRiskHighlightProps> = ({
  latestRisk,
  summary,
  advice,
  isAnalyzing,
  needsSync,
  lastSyncTime,
  onRefresh,
  onFindClinic
}) => {
  const risk = latestRisk.toLowerCase();
  const isHighRisk = risk.includes('high') || risk.includes('critical') || risk.includes('danger');
  const isModerateRisk = risk.includes('moderate') || risk.includes('medium');

  let bgClass = 'ai-gradient-low';
  let pulseClass = '';
  
  if (isHighRisk) {
    bgClass = 'ai-gradient-high';
    pulseClass = 'ai-pulse-danger';
  } else if (isModerateRisk) {
    bgClass = 'ai-gradient-medium';
    pulseClass = 'ai-pulse-warning';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-8 rounded-[40px] overflow-hidden transition-all duration-700 shadow-2xl ${bgClass} ${pulseClass} border border-white/20`}
    >
      {/* Futuristic Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl ring-1 ring-white/30">
              <Sparkles className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-3">
              Heart Intelligence
              {isAnalyzing && (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-white/95 text-lg font-medium leading-relaxed max-w-2xl font-display">
              "Heart Intelligence: {summary}"
            </p>
            {advice && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 bg-black/10 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              >
                <AlertCircle className="text-white/80 shrink-0 mt-1" size={18} />
                <p className="text-sm font-medium text-white/90">
                  <span className="text-white font-bold mr-1">Precision Advice:</span> {advice}
                </p>
              </motion.div>
            )}
          </div>

          {isHighRisk && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFindClinic}
              className="mt-6 bg-white text-rose-600 dark:bg-rose-600 dark:text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:shadow-white/20 transition-all group"
            >
              <Stethoscope size={18} className="group-hover:rotate-12 transition-transform" /> 
              Find Nearest Clinic
            </motion.button>
          )}
        </div>

        <div className="flex flex-col items-center md:items-end backdrop-blur-md bg-white/10 px-8 py-6 rounded-[32px] border border-white/20 shadow-inner">
          <div className="text-[10px] uppercase font-black font-display tracking-[0.3em] text-white/70 mb-2">Analysis Level</div>
          <div className="text-6xl font-display font-bold tracking-tighter text-white mb-1">
            {isHighRisk ? '82' : isModerateRisk ? '90' : '98'}
            <span className="text-2xl opacity-60 ml-1 font-display">%</span>
          </div>
          
          {/* Analysis Level Indicators */}
          <div className="w-full mt-2 space-y-1">
            <div className="flex items-center justify-between w-full text-[8px] font-bold text-white/50 px-1">
              <span>20</span>
              <span>40</span>
              <span>60</span>
              <span>80</span>
              <span>100</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${isHighRisk ? '82' : isModerateRisk ? '90' : '98'}%` }}
                className="absolute inset-y-0 left-0 bg-white"
              />
              {/* Tick Marks */}
              <div className="absolute inset-y-0 left-[20%] w-[1px] bg-white/20" />
              <div className="absolute inset-y-0 left-[40%] w-[1px] bg-white/20" />
              <div className="absolute inset-y-0 left-[60%] w-[1px] bg-white/20" />
              <div className="absolute inset-y-0 left-[80%] w-[1px] bg-white/20" />
            </div>
          </div>

          <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg
            ${isHighRisk ? 'bg-red-900/40 text-white' : isModerateRisk ? 'bg-amber-900/40 text-white' : 'bg-emerald-900/40 text-white'}`}>
            {risk} risk detected
          </div>
        </div>
      </div>
    </motion.div>
  );
};
