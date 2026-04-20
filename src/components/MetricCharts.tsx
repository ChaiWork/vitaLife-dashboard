/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Heart, Activity } from 'lucide-react';
import { ChartView } from '../types';

interface MetricChartsProps {
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  dailyBreakdown: any[];
  periodicTrends: { weekly: any[], monthly: any[] };
}

export function MetricCharts({ 
  chartView, 
  setChartView, 
  dailyBreakdown, 
  periodicTrends 
}: MetricChartsProps) {
  return (
    <div className="space-y-8">
      {/* Chart Section - Heart Rate */}
      <div className="glass-panel p-8 rounded-3xl h-[450px] flex flex-col shadow-sm border-minimal-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="font-bold text-lg text-minimal-ink flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              Heart Rate Trends
            </h3>
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
          <AreaChart 
            data={
              chartView === 'daily' ? dailyBreakdown : 
              chartView === 'weekly' ? periodicTrends.weekly : 
              periodicTrends.monthly
            }
          >
            <defs>
              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
            <XAxis 
              dataKey={chartView === 'daily' ? 'hour' : 'label'} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 600}}
              minTickGap={30}
            />
            <YAxis 
              hide 
              domain={[40, 'auto']}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}}
              cursor={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorHr)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* BP & Glucose Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl h-[400px] flex flex-col">
          <h3 className="font-bold text-sm text-minimal-ink mb-6 flex items-center gap-2">
            <Activity size={18} className="text-minimal-blue" />
            Blood Pressure Stability
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartView === 'daily' ? dailyBreakdown : periodicTrends.weekly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="hour" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip />
              <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="diastolic" stroke="#60a5fa" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-8 rounded-3xl h-[400px] flex flex-col">
          <h3 className="font-bold text-sm text-minimal-ink mb-6 flex items-center gap-2">
            <Activity size={18} className="text-emerald-500" />
            Glucose Management
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartView === 'daily' ? dailyBreakdown : periodicTrends.weekly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="hour" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip />
              <Area type="monotone" dataKey="glucose" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
