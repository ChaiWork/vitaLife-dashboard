/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Activity } from 'lucide-react';
import { StatCard } from './StatCard';
import { getHRStatus, getBPStatus, getGlucoseStatus } from '../utils/health';
import { AIInsight, UserProfile } from '../types';

interface DashboardTabProps {
  todayStats: any;
  profile: UserProfile | null;
  aiInsights: AIInsight[];
  isAnalyzing: boolean;
  onFindClinic: () => void;
}

export function DashboardTab({ 
  todayStats, 
  profile, 
  aiInsights, 
  isAnalyzing, 
  onFindClinic 
}: DashboardTabProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Heart Rate" 
          value={todayStats.hasDataToday ? todayStats.heartRate?.toString() || '--' : '--'} 
          unit="BPM"
          status={getHRStatus(todayStats.heartRate)}
        />
        <StatCard 
          label="Blood Pressure" 
          value={todayStats.hasDataToday && todayStats.systolic ? `${todayStats.systolic}/${todayStats.diastolic}` : '--'} 
          unit="mmHg"
          status={getBPStatus(todayStats.systolic, todayStats.diastolic)}
        />
        <StatCard 
          label="Blood Glucose" 
          value={todayStats.hasDataToday && todayStats.glucose ? todayStats.glucose.toString() : '--'} 
          unit="mg/dL"
          status={getGlucoseStatus(todayStats.glucose)}
        />
        <StatCard 
          label="Steps Today" 
          value={todayStats.hasDataToday ? todayStats.steps.toLocaleString() : '0'} 
          unit="steps"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Weight" value={profile?.weight || '--'} unit="kg" />
        <StatCard label="Height" value={profile?.height || '--'} unit="cm" />
        <StatCard label="Age" value={profile?.age ? `${profile.age} yrs` : '--'} unit="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heart Rate Analysis Card */}
        {(() => {
          // Look for heart rate specific insight or the latest if no specific one found
          const hrSpecificInsight = aiInsights.find(i => i.heartRate !== undefined || i.hrAnalysis);
          const insight = hrSpecificInsight || aiInsights[0];
          
          // Use utility for local analysis as a baseline/fallback
          const localHRAnalysis = getHRStatus(todayStats.heartRate);
          
          const analysis = insight?.hrAnalysis || {
            risk: insight?.risk || (todayStats.heartRate ? localHRAnalysis.level : 'Low'),
            summary: insight?.summary || 'Monitoring baseline heart rate patterns and cardiac variability.',
            advice: insight?.advice || 'Maintain a balanced activity level and stay hydrated.'
          };
          
          const latestRisk = analysis.risk;
          let bgClass = 'ai-gradient-low';
          if (latestRisk.toLowerCase().includes('high') || latestRisk.toLowerCase().includes('critical')) bgClass = 'ai-gradient-high';
          else if (latestRisk.toLowerCase().includes('moderate')) bgClass = 'ai-gradient-medium';

          return (
            <div className={`${bgClass} p-8 rounded-[32px] flex flex-col justify-between shadow-xl transition-all duration-500 hover:scale-[1.01]`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Heart size={24} className="animate-pulse" />
                    Heart Rate Status
                  </h2>
                  {isAnalyzing && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                </div>
                <p className="text-white/90 text-sm leading-relaxed min-h-[60px]">{analysis.summary}</p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">App Advice</p>
                  <p className="text-xs font-medium text-white">💡 {analysis.advice}</p>
                </div>
              </div>
              <div className="mt-8 flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold text-white">Clinical Risk</div>
                  <div className="text-2xl font-black text-white">{latestRisk}</div>
                </div>
                {latestRisk.toLowerCase().includes('high') && (
                  <button onClick={onFindClinic} className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                    Emergency Help
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Chronic Vitals Analysis Card */}
        {(() => {
          // Strictly look for chronic markers (systolic/diastolic/glucose)
          const chronicInsight = aiInsights.find(i => i.bpGlucoseAnalysis || i.systolic !== undefined);
          
          const analysis = chronicInsight?.bpGlucoseAnalysis || {
            risk: 'Standard',
            summary: 'System is currently processing your metabolic and hypertensive markers. Recent blood pressure and glucose readings are required for advanced analysis.',
            advice: 'Log your blood pressure and glucose regularly for targeted AI aged-care insights.'
          };
          
          const latestRisk = analysis.risk;
          let bgClass = 'ai-gradient-low';
          if (latestRisk.toLowerCase().includes('high') || latestRisk.toLowerCase().includes('critical')) bgClass = 'ai-gradient-high';
          else if (latestRisk.toLowerCase().includes('moderate')) bgClass = 'ai-gradient-medium';

          return (
            <div className={`${bgClass} p-8 rounded-[32px] flex flex-col justify-between shadow-xl transition-all duration-500 hover:scale-[1.01]`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Activity size={24} />
                    Chronic Vitals AI Analysis
                  </h2>
                  {isAnalyzing && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                </div>
                <p className="text-white/90 text-sm leading-relaxed min-h-[60px]">{analysis.summary}</p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Aged Care Tip</p>
                  <p className="text-xs font-medium text-white">🛡️ {analysis.advice}</p>
                </div>
              </div>
              <div className="mt-8 flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold text-white">Vitals Stability</div>
                  <div className="text-2xl font-black text-white">{latestRisk}</div>
                </div>
                {latestRisk.toLowerCase().includes('high') && (
                  <button onClick={onFindClinic} className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                    Clinic Locator
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}
