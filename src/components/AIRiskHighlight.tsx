import React from 'react';
import { Activity, Stethoscope } from 'lucide-react';

interface AIRiskHighlightProps {
  latestRisk: string;
  summary: string;
  advice: string;
  isAnalyzing: boolean;
  onFindClinic: () => void;
}

export const AIRiskHighlight: React.FC<AIRiskHighlightProps> = ({
  latestRisk,
  summary,
  advice,
  isAnalyzing,
  onFindClinic
}) => {
  let bgClass = 'ai-gradient';
  let healthIndex = '94';
  
  const risk = latestRisk.toLowerCase();

  if (risk.includes('high')) {
    bgClass = 'ai-gradient-high';
    healthIndex = '82';
  } else if (risk.includes('critical') || risk.includes('danger')) {
    bgClass = 'ai-gradient-high';
    healthIndex = '94';
  } else if (risk.includes('moderate') || risk.includes('medium')) {
    bgClass = 'ai-gradient-medium';
    healthIndex = '40';
  } else if (risk.includes('care')) {
    bgClass = 'ai-gradient-care';
    healthIndex = '60';
  } else {
    bgClass = 'ai-gradient-low';
    healthIndex = '20';
  }

  return (
    <div className={`${bgClass} p-8 rounded-3xl flex justify-between items-center shadow-lg transition-colors duration-500 text-white`}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Gemini AI Analysis
          {isAnalyzing && (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          )}
        </h2>
        <p className="text-white/90 text-sm max-w-xl leading-relaxed">
          {summary}
        </p>
        {advice && (
          <p className="text-xs font-medium bg-white/10 p-2 rounded-lg border border-white/20 mt-2">
            💡 Advice: {advice}
          </p>
        )}
        {(risk.includes('high') || risk.includes('critical') || risk.includes('danger')) && (
          <button 
            onClick={onFindClinic}
            className="mt-4 bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-50 transition-all shadow-md"
          >
            <Stethoscope size={14} /> Find Nearest Clinic
          </button>
        )}
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-widest opacity-80 font-bold mb-1">Health Index</div>
        <div className="text-5xl font-bold leading-tight">
          {healthIndex}
        </div>
        <div className="text-[10px] uppercase tracking-widest opacity-80 font-bold">
          {latestRisk} Risk
        </div>
      </div>
    </div>
  );
};
