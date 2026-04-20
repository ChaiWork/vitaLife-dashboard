import React from 'react';
import { motion } from 'motion/react';
import { Activity, Brain, ShieldCheck, AlertCircle } from 'lucide-react';

interface ChronicAIAnalysisProps {
  analysis: {
    risk: "Low" | "Moderate" | "High" | "Critical";
    summary: string;
    advice: string;
  } | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const ChronicAIAnalysis: React.FC<ChronicAIAnalysisProps> = ({ analysis, isAnalyzing, onAnalyze }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'from-red-500 to-red-600';
      case 'High': return 'from-orange-500 to-orange-600';
      case 'Moderate': return 'from-amber-500 to-amber-600';
      default: return 'from-emerald-500 to-emerald-600';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Critical': return <AlertCircle className="text-white" size={24} />;
      case 'High': return <Activity className="text-white" size={24} />;
      case 'Moderate': return <Brain className="text-white" size={24} />;
      default: return <ShieldCheck className="text-white" size={24} />;
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Brain size={120} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-minimal-blue/10 rounded-xl flex items-center justify-center text-minimal-blue">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-minimal-ink tracking-tight">Chronic Vitals Analysis</h3>
              <p className="text-xs text-minimal-muted">AI-driven metabolic & hypertension assessment</p>
            </div>
          </div>

          {!analysis && !isAnalyzing ? (
            <div className="bg-minimal-bg/50 border border-minimal-border border-dashed rounded-2xl p-8 text-center">
              <p className="text-sm text-minimal-muted mb-4 italic">Analysis for Blood Pressure & Glucose levels available</p>
              <button 
                onClick={onAnalyze}
                className="vital-button flex items-center gap-2 mx-auto"
              >
                Start Heart AI Analysis
              </button>
            </div>
          ) : isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-minimal-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-minimal-muted animate-pulse">Consulting Heart AI...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${getRiskColor(analysis.risk)} shadow-lg`}>
                  {getRiskIcon(analysis.risk)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-minimal-muted">Metabolic Risk Level</span>
                  </div>
                  <h4 className={`text-2xl font-black ${analysis.risk === 'Critical' ? 'text-red-500' : 'text-minimal-ink'}`}>
                    {analysis.risk}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-minimal-bg/40 p-5 rounded-2xl border border-minimal-border/50">
                  <p className="text-[10px] font-bold text-minimal-muted uppercase tracking-widest mb-2">Clinical Summary</p>
                  <p className="text-sm text-minimal-ink leading-relaxed font-medium">
                    {analysis.summary}
                  </p>
                </div>
                <div className="bg-minimal-blue/5 p-5 rounded-2xl border border-minimal-blue/10">
                  <p className="text-[10px] font-bold text-minimal-blue uppercase tracking-widest mb-2">AI Health Advice</p>
                  <p className="text-sm text-minimal-ink leading-relaxed font-semibold">
                    {analysis.advice}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <p className="text-[10px] text-minimal-muted italic">Powered by Heart AI Insight (backend coming soon)</p>
                <button 
                  onClick={onAnalyze}
                  className="text-xs font-bold text-minimal-blue hover:underline"
                >
                  Regenerate Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
