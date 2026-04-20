import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  hour?: string;
  label?: string;
  heartRate: number | null;
}

interface HealthChartsProps {
  chartView: 'daily' | 'weekly' | 'monthly';
  setChartView: (view: 'daily' | 'weekly' | 'monthly') => void;
  data: ChartData[];
}

export const HealthCharts: React.FC<HealthChartsProps> = ({ chartView, setChartView, data }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl h-[450px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="font-semibold text-lg text-minimal-ink">Heart Rate Trends</h3>
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
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7EA0EA" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#7EA0EA" stopOpacity={0}/>
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
            domain={[40, 'auto']}
          />
          <Tooltip 
            contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            itemStyle={{ color: '#7EA0EA' }}
            formatter={(value: any) => [value ? `${value} BPM` : '--', 'Avg Heart Rate']}
          />
          <Area 
            type="monotone" 
            dataKey="heartRate" 
            stroke="#7EA0EA" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorHr)"
            connectNulls={true}
            dot={chartView !== 'monthly' ? { r: 4, fill: '#7EA0EA', strokeWidth: 2, stroke: '#fff' } : false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
