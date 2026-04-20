/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  db, 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  User,
  serverTimestamp,
  setDoc,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { 
  HeartRateLog, 
  HeartRateBreakdown, 
  RiskEntry, 
  AIInsight, 
  Notification, 
  FamilyLink, 
  UserProfile 
} from '../types';

export function useHealthData(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [heartLogs, setHeartLogs] = useState<HeartRateLog[]>([]);
  const [breakdownLogs, setBreakdownLogs] = useState<HeartRateBreakdown[]>([]);
  const [riskHistory, setRiskHistory] = useState<RiskEntry[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastAlertedId = useRef<string | null>(null);

  // Derive Today's Stats
  const todayStats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const latestToday = heartLogs.find(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      return logDate >= startOfDay;
    });

    return {
      heartRate: latestToday ? latestToday.heartRate : null,
      systolic: latestToday ? latestToday.systolic : undefined,
      diastolic: latestToday ? latestToday.diastolic : undefined,
      glucose: latestToday ? latestToday.glucose : undefined,
      steps: latestToday ? latestToday.steps : 0,
      hasDataToday: !!latestToday
    };
  }, [heartLogs]);

  // Derive Hourly Breakdown
  const dailyBreakdown = useMemo(() => {
    if (breakdownLogs.length > 0) {
      return Array.from({ length: 24 }, (_, hour) => {
        const found = breakdownLogs.find(b => b.hour === hour);
        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          heartRate: found ? found.heartRate : null,
          displayRate: found ? found.heartRate : 0
        };
      });
    }

    const buckets: Record<number, number[]> = {};
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    heartLogs.forEach(log => {
      const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
      if (logDate >= startOfDay) {
        const hour = logDate.getHours();
        if (!buckets[hour]) buckets[hour] = [];
        buckets[hour].push(log.heartRate);
      }
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const values = buckets[hour];
      const avg = values && values.length > 0 ? Math.round(values.reduce((a, b) => a + b) / values.length) : null;
      
      const logsInHour = heartLogs.filter(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return logDate >= startOfDay && logDate.getHours() === hour;
      });

      const avgSys = logsInHour.some(l => l.systolic) ? Math.round(logsInHour.reduce((sum, l) => sum + (l.systolic || 0), 0) / logsInHour.filter(l => l.systolic).length) : null;
      const avgDia = logsInHour.some(l => l.diastolic) ? Math.round(logsInHour.reduce((sum, l) => sum + (l.diastolic || 0), 0) / logsInHour.filter(l => l.diastolic).length) : null;
      const avgGluc = logsInHour.some(l => l.glucose) ? Math.round(logsInHour.reduce((sum, l) => sum + (l.glucose || 0), 0) / logsInHour.filter(l => l.glucose).length) : null;

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        heartRate: avg,
        displayRate: avg || 0,
        systolic: avgSys,
        diastolic: avgDia,
        glucose: avgGluc
      };
    });
  }, [heartLogs, breakdownLogs]);

  // Trends
  const periodicTrends = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekDayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const getDailyAverages = (days: number) => {
      const breakdownHR: Record<string, number[]> = {};
      const breakdownSys: Record<string, number[]> = {};
      const breakdownDia: Record<string, number[]> = {};
      const breakdownGluc: Record<string, number[]> = {};
      const results = [];

      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toDateString();
        breakdownHR[key] = [];
        breakdownSys[key] = [];
        breakdownDia[key] = [];
        breakdownGluc[key] = [];
        
        let label = '';
        if (days === 7) label = weekDayShort[d.getDay()];
        else if (i === 0) label = '-30d';
        else if (i === 14) label = '-15d';
        else if (i === days - 1) label = 'Today';

        results.push({ key, label, heartRate: null, systolic: null, diastolic: null, glucose: null });
      }

      heartLogs.forEach(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        const key = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).toDateString();
        if (breakdownHR[key] !== undefined) {
          breakdownHR[key].push(log.heartRate);
          if (log.systolic) breakdownSys[key].push(log.systolic);
          if (log.diastolic) breakdownDia[key].push(log.diastolic);
          if (log.glucose) breakdownGluc[key].push(log.glucose);
        }
      });

      return results.map(r => {
        const hVals = breakdownHR[r.key];
        const sVals = breakdownSys[r.key];
        const dVals = breakdownDia[r.key];
        const gVals = breakdownGluc[r.key];
        
        return { 
          ...r, 
          heartRate: hVals.length > 0 ? Math.round(hVals.reduce((a, b) => a + b) / hVals.length) : null,
          systolic: sVals.length > 0 ? Math.round(sVals.reduce((a, b) => a + b) / sVals.length) : null,
          diastolic: dVals.length > 0 ? Math.round(dVals.reduce((a, b) => a + b) / dVals.length) : null,
          glucose: gVals.length > 0 ? Math.round(gVals.reduce((a, b) => a + b) / gVals.length) : null
        };
      });
    };

    return {
      weekly: getDailyAverages(7),
      monthly: getDailyAverages(30)
    };
  }, [heartLogs]);

  // Unified History
  const unifiedHistory = useMemo(() => {
    const historicalEntries = riskHistory.map(entry => ({
      id: entry.id,
      date: entry.date,
      sortDate: new Date(entry.date).getTime(),
      risk: entry.riskLevel,
      summary: entry.summary,
      advice: entry.advice,
      heartRate: null,
      source: 'Standard Analysis'
    }));

    const aiEntries = aiInsights.map(insight => {
      const insightDate = insight.date?.toDate ? insight.date.toDate() : new Date(insight.date);
      return {
        id: insight.id,
        date: insightDate.toLocaleDateString(),
        sortDate: insightDate.getTime(),
        risk: insight.risk,
        summary: insight.summary,
        advice: insight.advice,
        heartRate: insight.heartRate,
        source: 'AI Insight'
      };
    });

    return [...historicalEntries, ...aiEntries].sort((a, b) => b.sortDate - a.sortDate);
  }, [riskHistory, aiInsights]);

  // Listeners
  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (d) => {
      if (d.exists()) setProfile(d.data() as UserProfile);
    });

    const unsubLogs = onSnapshot(query(collection(db, 'users', user.uid, 'heart_rate_logs'), orderBy('createdAt', 'desc'), limit(500)), (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)).map(data => ({
        id: data.id,
        heartRate: data.heartRate || data.heart_rate_logs || data.bpm || data.value || 0,
        systolic: data.systolic,
        diastolic: data.diastolic,
        glucose: data.glucose,
        steps: data.steps || 0,
        spo2: data.spo2,
        createdAt: data.createdAt || data.timestamp || null
      } as HeartRateLog));
      setHeartLogs(logs);
    });

    const unsubInsights = onSnapshot(query(collection(db, 'users', user.uid, 'ai_insights'), orderBy('createdAt', 'desc'), limit(10)), (snapshot) => {
      setAiInsights(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AIInsight)));
    });

    const unsubNotifications = onSnapshot(query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(20)), (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });

    const unsubFamily = onSnapshot(query(collection(db, 'users', user.uid, 'family_links')), (snapshot) => {
      setFamilyLinks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FamilyLink)));
    });

    return () => {
      unsubProfile();
      unsubLogs();
      unsubInsights();
      unsubNotifications();
      unsubFamily();
    };
  }, [user]);

  // Emergency Monitoring
  useEffect(() => {
    if (!user || heartLogs.length === 0) return;
    const latest = heartLogs[0];
    const logDate = latest.createdAt?.toDate ? latest.createdAt.toDate() : new Date(latest.createdAt);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const isEmergency = latest.heartRate < 40 || latest.heartRate > 130;

    if (logDate > tenMinutesAgo && isEmergency && lastAlertedId.current !== latest.id) {
       const alertFamily = async () => {
         lastAlertedId.current = latest.id;
         const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
         await setDoc(notifRef, {
           title: 'Critical Heart Rate Alert',
           message: `Emergency: Detected heart rate of ${latest.heartRate} BPM.`,
           type: 'emergency',
           read: false,
           createdAt: serverTimestamp()
         });
         
         // Alert family member
         familyLinks.forEach(async (link) => {
           const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
           await setDoc(familyNotifRef, {
             title: `Emergency Alert: ${user.displayName || 'Family Member'}`,
             message: `Critical: Dangerous heart rate of ${latest.heartRate} BPM detected.`,
             type: 'emergency',
             read: false,
             createdAt: serverTimestamp()
           });
         });
       };
       alertFamily();
    }
  }, [user, heartLogs, familyLinks]);

  const refreshData = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return {
    profile,
    heartLogs,
    todayStats,
    dailyBreakdown,
    periodicTrends,
    unifiedHistory,
    aiInsights,
    notifications,
    familyLinks,
    isSyncing,
    refreshData
  };
}
