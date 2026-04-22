import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Brain, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ChartData {
  hour?: string;
  label?: string;
  heartRate: number | null;
  systolic?: number | null;
  diastolic?: number | null;
  glucose?: number | null;
  bmi?: number | null;
}

interface HealthChartsProps {
  chartView: 'daily' | 'weekly' | 'monthly';
  setChartView: (view: 'daily' | 'weekly' | 'monthly') => void;
  data: ChartData[];
  activeMetric: MetricType;
  setActiveMetric: (metric: MetricType) => void;
}

type MetricType = 'heartRate' | 'bloodPressure' | 'bloodGlucose' | 'bmi';

export const HealthCharts: React.FC<HealthChartsProps> = ({ 
  chartView, 
  setChartView, 
  data,
  activeMetric,
  setActiveMetric
}) => {

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'heartRate': return 'Heart Rate';
      case 'bloodPressure': return 'Blood Pressure';
      case 'bloodGlucose': return 'Blood Glucose';
      case 'bmi': return 'BMI Index';
      default: return '';
    }
  };

  const getUnit = () => {
    switch (activeMetric) {
      case 'heartRate': return 'BPM';
      case 'bloodPressure': return 'mmHg';
      case 'bloodGlucose': return 'mg/dL';
      case 'bmi': return 'kg/m²';
      default: return '';
    }
  };

  const getAIHighlight = () => {
    switch (activeMetric) {
      case 'heartRate': return "AI analyzing resting patterns. Latest data suggests stable autonomic recovery.";
      case 'bloodPressure': return "Vascular AI scan: Pulse pressure is within optimal bandwidth.";
      case 'bloodGlucose': return "Metabolic AI: No significant spikes detected in recent cycles.";
      case 'bmi': return "Longitudinal BMI Analysis: Tracking body mass index trends to assess metabolic efficiency.";
      default: return "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel p-8 rounded-3xl h-[500px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={120} />
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-display font-bold text-2xl tracking-tight text-minimal-ink">{getMetricLabel()}</h3>
                <div className="flex gap-1 bg-minimal-bg/50 backdrop-blur-md p-1 rounded-xl border border-minimal-border transition-all">
                  {(['heartRate', 'bloodPressure', 'bloodGlucose', 'bmi'] as MetricType[]).map((m) => (
                    <button 
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter ${activeMetric === m ? 'bg-white shadow-xl ring-1 ring-black/5 text-minimal-blue' : 'text-minimal-muted/60 hover:text-minimal-ink'}`}
                    >
                      {m === 'heartRate' ? 'HR' : m === 'bloodPressure' ? 'BP' : m === 'bloodGlucose' ? 'GLU' : 'BMI'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs font-bold text-minimal-muted uppercase tracking-widest opacity-60 px-0.5">
                {chartView === 'daily' ? '24-Hour Digital Telemetry' : 
                 chartView === 'weekly' ? '7-Day Aggregated Trend' : '30-Day Historical Baseline'}
              </p>
            </div>
            
            <div className="flex bg-minimal-bg/50 backdrop-blur-md p-1 rounded-2xl border border-minimal-border">
              {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setChartView(view)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
                    chartView === view 
                      ? 'bg-white text-minimal-ink shadow-lg ring-1 ring-black/5' 
                      : 'text-minimal-muted/80 hover:text-minimal-ink'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 relative z-10 px-4">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'bloodPressure' ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-minimal-border)" vertical={false} opacity={0.15} />
                  <XAxis 
                    dataKey={chartView === 'daily' ? "hour" : "label"} 
                    stroke="var(--color-minimal-muted)" 
                    fontSize={10} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                    interval={chartView === 'monthly' ? 0 : (chartView === 'daily' ? 3 : 0)}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="var(--color-minimal-muted)" 
                    fontSize={10} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                    domain={[60, 180]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--color-tooltip-bg)', 
                      backdropFilter: 'blur(10px)', 
                      border: '1px solid var(--color-card-border)', 
                      borderRadius: '24px', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
                    }}
                    labelStyle={{ color: 'var(--color-minimal-ink)', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: any, name: string) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#FF3B30" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#FF3B30', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#7EA0EA" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#7EA0EA', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                </LineChart>
              ) : (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetric === 'bloodGlucose' ? '#A8BCFB' : (activeMetric === 'bmi' ? '#7EA0EA' : '#7EA0EA')} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={activeMetric === 'bloodGlucose' ? '#A8BCFB' : (activeMetric === 'bmi' ? '#7EA0EA' : '#7EA0EA')} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-minimal-border)" vertical={false} opacity={0.15} />
                  <XAxis 
                    dataKey={chartView === 'daily' ? "hour" : "label"} 
                    stroke="var(--color-minimal-muted)" 
                    fontSize={10}
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                    interval={chartView === 'monthly' ? 0 : (chartView === 'daily' ? 3 : 0)}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="var(--color-minimal-muted)" 
                    fontSize={10} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false} 
                    domain={activeMetric === 'bloodGlucose' ? [40, 200] : (activeMetric === 'bmi' ? [15, 45] : [40, 'auto'])}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--color-tooltip-bg)', 
                      backdropFilter: 'blur(10px)', 
                      border: '1px solid var(--color-card-border)', 
                      borderRadius: '24px', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
                    }}
                    labelStyle={{ color: 'var(--color-minimal-ink)', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: activeMetric === 'bloodGlucose' ? '#A8BCFB' : (activeMetric === 'bmi' ? '#7EA0EA' : '#7EA0EA') }}
                    formatter={(value: any) => [value ? `${value} ${getUnit()}` : '--', getMetricLabel()]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric === 'heartRate' ? 'heartRate' : (activeMetric === 'bloodGlucose' ? 'glucose' : 'bmi')} 
                    stroke={activeMetric === 'bloodGlucose' ? '#A8BCFB' : (activeMetric === 'bmi' ? '#7EA0EA' : '#7EA0EA')} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorMetric)"
                    connectNulls={true}
                    dot={chartView !== 'monthly' ? { 
                      r: 6, 
                      fill: activeMetric === 'bloodGlucose' ? '#A8BCFB' : (activeMetric === 'bmi' ? '#7EA0EA' : '#7EA0EA'), 
                      strokeWidth: 2, 
                      stroke: '#fff',
                      opacity: 1
                    } : false}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
