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
}

interface HealthChartsProps {
  chartView: 'daily' | 'weekly' | 'monthly';
  setChartView: (view: 'daily' | 'weekly' | 'monthly') => void;
  data: ChartData[];
}

type MetricType = 'heartRate' | 'bloodPressure' | 'bloodGlucose';

export const HealthCharts: React.FC<HealthChartsProps> = ({ chartView, setChartView, data }) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('heartRate');

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'heartRate': return 'Heart Rate';
      case 'bloodPressure': return 'Blood Pressure';
      case 'bloodGlucose': return 'Blood Glucose';
      default: return '';
    }
  };

  const getUnit = () => {
    switch (activeMetric) {
      case 'heartRate': return 'BPM';
      case 'bloodPressure': return 'mmHg';
      case 'bloodGlucose': return 'mg/dL';
      default: return '';
    }
  };

  const getAIHighlight = () => {
    switch (activeMetric) {
      case 'heartRate': return "AI analyzing resting patterns. Latest data suggests stable autonomic recovery.";
      case 'bloodPressure': return "Vascular AI scan: Pulse pressure is within optimal bandwidth.";
      case 'bloodGlucose': return "Metabolic AI: No significant spikes detected in recent cycles.";
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
                <h3 className="font-bold text-xl tracking-tight text-minimal-ink">{getMetricLabel()}</h3>
                <div className="flex gap-1 bg-minimal-bg p-1 rounded-xl border border-minimal-border">
                  {(['heartRate', 'bloodPressure', 'bloodGlucose'] as MetricType[]).map((m) => (
                    <button 
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter ${activeMetric === m ? 'bg-white shadow-sm ring-1 ring-black/5 text-minimal-blue' : 'text-minimal-muted'}`}
                    >
                      {m === 'heartRate' ? 'HR' : m === 'bloodPressure' ? 'BP' : 'GLU'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs font-medium text-minimal-muted">
                {chartView === 'daily' ? '24-Hour Real-time Telemetry' : 
                 chartView === 'weekly' ? '7-Day Aggregated Trend' : '30-Day Historical Baseline'}
              </p>
            </div>
            
            <div className="flex bg-minimal-bg p-1 rounded-2xl border border-minimal-border">
              {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setChartView(view)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    chartView === view 
                      ? 'bg-white text-minimal-ink shadow-sm ring-1 ring-black/5' 
                      : 'text-minimal-muted hover:text-minimal-ink'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'bloodPressure' ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F3" vertical={false} />
                  <XAxis 
                    dataKey={chartView === 'daily' ? "hour" : "label"} 
                    stroke="#A1A1AA" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={chartView === 'monthly' ? 0 : (chartView === 'daily' ? 3 : 0)}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#A1A1AA" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[60, 180]}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(value: any, name: string) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#FF3B30" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#FF3B30', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls={true}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#007AFF" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#007AFF', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls={true}
                  />
                </LineChart>
              ) : (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetric === 'bloodGlucose' ? '#FF9F0A' : '#5856D6'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={activeMetric === 'bloodGlucose' ? '#FF9F0A' : '#5856D6'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F3" vertical={false} />
                  <XAxis 
                    dataKey={chartView === 'daily' ? "hour" : "label"} 
                    stroke="#A1A1AA" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={chartView === 'monthly' ? 0 : (chartView === 'daily' ? 3 : 0)}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#A1A1AA" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={activeMetric === 'bloodGlucose' ? [40, 200] : [40, 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: activeMetric === 'bloodGlucose' ? '#FF9F0A' : '#5856D6' }}
                    formatter={(value: any) => [value ? `${value} ${getUnit()}` : '--', getMetricLabel()]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric === 'heartRate' ? 'heartRate' : 'glucose'} 
                    stroke={activeMetric === 'bloodGlucose' ? '#FF9F0A' : '#5856D6'} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMetric)"
                    connectNulls={true}
                    dot={chartView !== 'monthly' ? { r: 4, fill: activeMetric === 'bloodGlucose' ? '#FF9F0A' : '#5856D6', strokeWidth: 2, stroke: '#fff' } : false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
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
