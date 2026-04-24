import React from 'react';
import { motion } from 'motion/react';
import { Activity, Brain, ShieldCheck, AlertCircle } from 'lucide-react';

interface ChronicAIAnalysisProps {
  analysis: {
    risk: "Low" | "Moderate" | "High" | "Critical";
    summary: string;
    advice: string;
    clinicalSummary?: string;
    futureRisks?: string;
    medications?: string;
    prevention?: string;
  } | null;
  isAnalyzing: boolean;
  needsSync?: boolean;
  onSync?: () => void;
  onAnalyze: () => void;
}

export const ChronicAIAnalysis: React.FC<ChronicAIAnalysisProps> = ({ analysis, isAnalyzing, needsSync, onSync, onAnalyze }) => {
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
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-minimal-blue/10 rounded-xl flex items-center justify-center text-minimal-blue">
              <Brain size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-xl text-minimal-ink tracking-tight">Chronic Clinical Intelligence</h3>
                <button 
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 bg-minimal-blue/10 hover:bg-minimal-blue/20 text-minimal-blue rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 text-xs font-bold"
                  title="Run Full Clinical Analysis"
                >
                  <Activity size={14} className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
              </div>
              <p className="text-xs text-minimal-muted">Professional Assessment: Hypertension, Metabolic & Future Projections</p>
            </div>
          </div>

          {!analysis && !isAnalyzing ? (
            <div className="bg-minimal-bg/50 border border-minimal-border border-dashed rounded-2xl p-8 text-center">
              <p className="text-sm text-minimal-muted mb-4 italic">Detailed clinical assessment will generate automatically after your current vitals are logged.</p>
            </div>
          ) : isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-minimal-blue/20 rounded-full" />
                <div className="w-16 h-16 border-4 border-minimal-blue border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              </div>
              <p className="text-sm font-bold text-minimal-ink animate-pulse tracking-wide">AI CLINICAL ASSISTANT CONSULTING...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 bg-minimal-bg/30 p-4 rounded-2xl border border-minimal-border/50">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${getRiskColor(analysis.risk)} shadow-lg`}>
                  {getRiskIcon(analysis.risk)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-minimal-muted">Projected Health Risk</span>
                  </div>
                  <h4 className={`text-2xl font-black tracking-tight ${analysis.risk === 'Critical' ? 'text-red-500' : 'text-minimal-ink'}`}>
                    {analysis.risk} Risk Profile
                  </h4>
                </div>
              </div>

              {/* Professional Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Summary Section */}
                  <div className="bg-white/40 dark:bg-white/5 p-6 rounded-2xl border border-minimal-border shadow-sm">
                    <div className="text-[10px] font-black text-minimal-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-minimal-ink rounded-full" /> Clinical Summary
                    </div>
                    <p className="text-sm text-minimal-ink leading-relaxed font-bold">
                      {analysis.summary}
                    </p>
                    {analysis.clinicalSummary && (
                      <p className="text-xs text-minimal-muted mt-3 leading-relaxed">
                        {analysis.clinicalSummary}
                      </p>
                    )}
                  </div>

                  {/* Future Risks */}
                  {analysis.futureRisks && (
                    <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                      <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={12} /> Projection: Future Conditions
                      </div>
                      <p className="text-sm text-orange-900 leading-relaxed font-semibold italic">
                        "{analysis.futureRisks}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Professional Advice */}
                  <div className="bg-minimal-blue/5 p-6 rounded-2xl border border-minimal-blue/10">
                    <p className="text-[10px] font-black text-minimal-blue uppercase tracking-widest mb-3">Professional Medical Advice</p>
                    <div className="space-y-4">
                      <p className="text-sm text-minimal-ink leading-relaxed font-bold">
                        {analysis.advice}
                      </p>
                      {analysis.prevention && (
                        <div className="pt-3 border-t border-minimal-blue/10">
                          <p className="text-[9px] font-bold text-minimal-muted uppercase mb-2">Preventative Actions</p>
                          <p className="text-xs text-minimal-ink font-medium leading-relaxed">
                            {analysis.prevention}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medications */}
                  {analysis.medications && (
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Requisite Guideline Considerations</p>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {analysis.medications}
                      </p>
                      <p className="text-[8px] mt-3 text-emerald-700/60 font-bold uppercase tracking-tighter">
                        *Disclaimer: This is AI-assisted clinical data. Always verify with your personal physician.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
