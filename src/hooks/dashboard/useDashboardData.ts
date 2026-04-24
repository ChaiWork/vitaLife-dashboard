import { useMemo } from 'react';
import { HeartRateLog, ChronicVitalLog, HeartRateBreakdown, BMILog, RiskEntry, AIInsight } from '../../types';

interface DashboardData {
  heartLogs: HeartRateLog[];
  chronicLogs: ChronicVitalLog[];
  breakdownLogs: HeartRateBreakdown[];
  bmiLogs: BMILog[];
  riskHistory: RiskEntry[];
  aiInsights: AIInsight[];
  chronicInsights: AIInsight[];
}

export function useDashboardData({
  heartLogs,
  chronicLogs,
  breakdownLogs,
  bmiLogs,
  riskHistory,
  aiInsights,
  chronicInsights
}: DashboardData) {
  
  const todayStats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const latestHeart = heartLogs.find(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      return logDate >= startOfDay;
    });

    const latestChronic = chronicLogs.find(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      return logDate >= startOfDay;
    });

    const lastLog = heartLogs[0];
    const chronicLog = chronicLogs[0];
    const lastHeartTime = lastLog?.createdAt?.toDate ? lastLog.createdAt.toDate().getTime() : (lastLog ? new Date(lastLog.createdAt).getTime() : 0);
    const lastChronicTime = chronicLog?.createdAt?.toDate ? chronicLog.createdAt.toDate().getTime() : (chronicLog ? new Date(chronicLog.createdAt).getTime() : 0);
    const lastHeartValue = lastLog?.heartRate || null;
    
    const isInactive = lastHeartTime > 0 && (Date.now() - lastHeartTime > 7200000); // 2 hours

    return {
      heartRate: latestHeart ? latestHeart.heartRate : null,
      systolic: latestChronic ? latestChronic.systolic : undefined,
      diastolic: latestChronic ? latestChronic.diastolic : undefined,
      glucose: latestChronic ? latestChronic.glucose : undefined,
      spo2: latestChronic ? latestChronic.spo2 : undefined,
      steps: (latestHeart && latestHeart.steps !== undefined) ? latestHeart.steps : 0,
      hasDataToday: !!latestHeart || !!latestChronic,
      isInactive,
      lastLogTime: Math.max(lastHeartTime, lastChronicTime),
      lastHeartValue
    };
  }, [heartLogs, chronicLogs]);

  const dailyBreakdown = useMemo(() => {
    const buckets: Record<number, { hr: number[], sys: number[], dia: number[], glu: number[], bmi: number[] }> = {};
    for (let i = 0; i < 24; i++) buckets[i] = { hr: [], sys: [], dia: [], glu: [], bmi: [] };

    breakdownLogs.forEach(b => {
      const h = b.hour;
      if (b.heartRate) buckets[h].hr.push(b.heartRate);
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    heartLogs.forEach(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      if (logDate >= startOfDay) {
        const hour = logDate.getHours();
        if (log.heartRate) buckets[hour].hr.push(log.heartRate);
      }
    });

    chronicLogs.forEach(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      if (logDate >= startOfDay) {
        const hour = logDate.getHours();
        if (log.systolic) buckets[hour].sys.push(log.systolic);
        if (log.diastolic) buckets[hour].dia.push(log.diastolic);
        if (log.glucose) buckets[hour].glu.push(log.glucose);
      }
    });

    bmiLogs.forEach(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      if (logDate >= startOfDay) {
        const hour = logDate.getHours();
        if (log.bmi) buckets[hour].bmi.push(log.bmi);
      }
    });

    const latestBmiValue = bmiLogs[0]?.bmi || null;

    return Array.from({ length: 24 }, (_, hour) => {
      const b = buckets[hour];
      return { 
        hour: `${hour.toString().padStart(2, '0')}:00`, 
        heartRate: b.hr.length > 0 ? Math.round(b.hr.reduce((a, b) => a + b) / b.hr.length) : null,
        systolic: b.sys.length > 0 ? Math.round(b.sys.reduce((a, b) => a + b) / b.sys.length) : null,
        diastolic: b.dia.length > 0 ? Math.round(b.dia.reduce((a, b) => a + b) / b.dia.length) : null,
        glucose: b.glu.length > 0 ? Math.round(b.glu.reduce((a, b) => a + b) / b.glu.length) : null,
        bmi: b.bmi.length > 0 ? b.bmi[b.bmi.length - 1] : latestBmiValue
      };
    });
  }, [heartLogs, chronicLogs, breakdownLogs, bmiLogs]);

  const periodicTrends = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekDayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const latestBmiValue = bmiLogs[0]?.bmi || null;

    const getDailyAverages = (days: number) => {
      const breakdown: Record<string, { hr: number[], sys: number[], dia: number[], glu: number[], bmi: number[] }> = {};
      const results = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toDateString();
        breakdown[key] = { hr: [], sys: [], dia: [], glu: [], bmi: [] };
        let label = days === 7 
          ? weekDayShort[d.getDay()] 
          : (i === 0 ? '-30d' : (i === 10 ? '-20d' : (i === 20 ? '-10d' : (i === days - 1 ? 'Today' : ''))));
        results.push({ key, label });
      }

      heartLogs.forEach(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        const key = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).toDateString();
        if (breakdown[key] && log.heartRate) breakdown[key].hr.push(log.heartRate);
      });

      chronicLogs.forEach(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        const key = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).toDateString();
        if (breakdown[key]) {
          if (log.systolic) breakdown[key].sys.push(log.systolic);
          if (log.diastolic) breakdown[key].dia.push(log.diastolic);
          if (log.glucose) breakdown[key].glu.push(log.glucose);
        }
      });

      bmiLogs.forEach(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        const key = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).toDateString();
        if (breakdown[key] && log.bmi) breakdown[key].bmi.push(log.bmi);
      });

      let currentBmiCarrier = latestBmiValue;

      return results.reverse().map(r => {
        const b = breakdown[r.key];
        const dayBmi = b.bmi.length > 0 ? b.bmi[b.bmi.length - 1] : currentBmiCarrier;
        if (b.bmi.length > 0) currentBmiCarrier = b.bmi[0]; // Naive back-filling for historicals
        
        return { 
          ...r, 
          heartRate: b.hr.length > 0 ? Math.round(b.hr.reduce((a, b) => a + b) / b.hr.length) : null,
          systolic: b.sys.length > 0 ? Math.round(b.sys.reduce((a, b) => a + b) / b.sys.length) : null,
          diastolic: b.dia.length > 0 ? Math.round(b.dia.reduce((a, b) => a + b) / b.dia.length) : null,
          glucose: b.glu.length > 0 ? Math.round(b.glu.reduce((a, b) => a + b) / b.glu.length) : null,
          bmi: dayBmi
        };
      }).reverse();
    };
    return { weekly: getDailyAverages(7), monthly: getDailyAverages(30) };
  }, [heartLogs, chronicLogs, bmiLogs]);

  const unifiedHistory = useMemo(() => {
    const historicalEntries = riskHistory.map(entry => ({
      id: entry.id,
      date: entry.date,
      sortDate: entry.time?.toDate ? entry.time.toDate().getTime() : (entry.date ? new Date(entry.date).getTime() : 0),
      risk: entry.riskLevel,
      summary: entry.summary,
      advice: entry.advice,
      heartRate: null,
      source: 'Chronic Analysis'
    }));
    
    const aiEntries = aiInsights.map(insight => {
      const insightDate = insight.date?.toDate ? insight.date.toDate() : new Date(insight.date);
      return {
        id: insight.id,
        date: insightDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + insightDate.toLocaleDateString(),
        sortDate: insightDate.getTime(),
        risk: insight.risk,
        summary: insight.summary,
        advice: insight.advice,
        heartRate: insight.heartRate,
        source: 'Heart AI'
      };
    });

    const metabolicEntries = chronicInsights.map(insight => {
        const insightDate = insight.createdAt?.toDate ? insight.createdAt.toDate() : new Date(insight.createdAt);
        return {
          id: insight.id,
          date: insightDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + insightDate.toLocaleDateString(),
          sortDate: insightDate.getTime(),
          risk: insight.risk,
          summary: insight.summary,
          advice: insight.advice,
          heartRate: null,
          source: 'Metabolic Insight'
        };
      });

    return [...historicalEntries, ...aiEntries].sort((a, b) => b.sortDate - a.sortDate);
  }, [riskHistory, aiInsights]);

  return {
    todayStats,
    dailyBreakdown,
    periodicTrends,
    unifiedHistory
  };
}
