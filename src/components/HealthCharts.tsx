import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

  return (
    <div className="glass-panel p-8 rounded-3xl h-[500px] flex flex-col">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-lg text-minimal-ink">{getMetricLabel()} Trends</h3>
            <div className="flex gap-1 bg-minimal-bg p-1 rounded-lg border border-minimal-border">
              <button 
                onClick={() => setActiveMetric('heartRate')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeMetric === 'heartRate' ? 'bg-white shadow-sm ring-1 ring-black/5 text-minimal-blue' : 'text-minimal-muted'}`}
              >
                HR
              </button>
              <button 
                onClick={() => setActiveMetric('bloodPressure')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeMetric === 'bloodPressure' ? 'bg-white shadow-sm ring-1 ring-black/5 text-minimal-blue' : 'text-minimal-muted'}`}
              >
                BP
              </button>
              <button 
                onClick={() => setActiveMetric('bloodGlucose')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeMetric === 'bloodGlucose' ? 'bg-white shadow-sm ring-1 ring-black/5 text-minimal-blue' : 'text-minimal-muted'}`}
              >
                GLU
              </button>
            </div>
          </div>
          <p className="text-xs text-minimal-muted">
            {chartView === 'daily' ? '24-Hour Average Breakdown' : 
             chartView === 'weekly' ? 'Last 7 Days Trend' : 'Last 30 Days Trend'}
          </p>
        </div>
        
        <div className="flex bg-minimal-bg p-1 rounded-xl border border-minimal-border">
          {(['daily', 'weekly', 'monthly'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setChartView(view)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
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

      <ResponsiveContainer width="100%" height="100%">
        {activeMetric === 'bloodPressure' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E7" vertical={false} />
            <XAxis 
              dataKey={chartView === 'daily' ? "hour" : "label"} 
              stroke="#86868B" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              interval={chartView === 'monthly' ? 0 : (chartView === 'daily' ? 3 : 0)}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#86868B" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              domain={[60, 200]}
            />
            <Tooltip 
              contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              formatter={(value: any, name: string) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
            />
            <Line 
              type="monotone" 
              dataKey="systolic" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
              connectNulls={true}
            />
            <Line 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
              connectNulls={true}
            />
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeMetric === 'bloodGlucose' ? '#F59E0B' : '#7EA0EA'} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={activeMetric === 'bloodGlucose' ? '#F59E0B' : '#7EA0EA'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E7" vertical={false} />
            <XAxis 
              dataKey={chartView === 'daily' ? "hour" : "label"} 
              stroke="#86868B" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              interval={chartView === 'monthly' ? 0 : (chartView === 'daily' ? 3 : 0)}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              stroke="#86868B" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              domain={activeMetric === 'bloodGlucose' ? [40, 250] : [40, 'auto']}
            />
            <Tooltip 
              contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              itemStyle={{ color: activeMetric === 'bloodGlucose' ? '#F59E0B' : '#7EA0EA' }}
              formatter={(value: any) => [value ? `${value} ${getUnit()}` : '--', getMetricLabel()]}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric === 'heartRate' ? 'heartRate' : 'glucose'} 
              stroke={activeMetric === 'bloodGlucose' ? '#F59E0B' : '#7EA0EA'} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorMetric)"
              connectNulls={true}
              dot={chartView !== 'monthly' ? { r: 4, fill: activeMetric === 'bloodGlucose' ? '#F59E0B' : '#7EA0EA', strokeWidth: 2, stroke: '#fff' } : false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
