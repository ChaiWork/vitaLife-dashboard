import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  HeartRateLog, 
  ChronicVitalLog,
  HeartRateBreakdown, 
  AIInsight, 
  Notification, 
  FamilyLink, 
  RiskEntry,
  AuthUser,
  BMILog,
  GraphAIHistory,
  VulnerabilityAlert
} from '../types';

export function useHealthData(user: AuthUser | null) {
  const [heartLogs, setHeartLogs] = useState<HeartRateLog[]>([]);
  const [chronicLogs, setChronicLogs] = useState<ChronicVitalLog[]>([]);
  const [breakdownLogs, setBreakdownLogs] = useState<HeartRateBreakdown[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([]);
  const [riskHistory, setRiskHistory] = useState<RiskEntry[]>([]);
  const [bmiLogs, setBmiLogs] = useState<BMILog[]>([]);
  const [chronicInsights, setChronicInsights] = useState<AIInsight[]>([]);
  const [graphAIHistory, setGraphAIHistory] = useState<GraphAIHistory[]>([]);
  const [vulnerabilityAlerts, setVulnerabilityAlerts] = useState<VulnerabilityAlert[]>([]);

  // Listen for Heart Rate Logs
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'heart_rate_logs'),
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => {
        const data = d.data();
        const rate = data.heartRate || data.bpm || data.value || 0;
        return { id: d.id, heartRate: rate, ...data } as HeartRateLog;
      });
      setHeartLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/heart_rate_logs`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Heart Rate Breakdown
  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const q = query(
      collection(db, 'users', user.uid, 'heart_rate_breakdown'),
      where('date', '>=', startOfDay),
      orderBy('date', 'desc'),
      limit(24)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HeartRateBreakdown));
      // Sort client-side by hour to ensure chronological breakdown display without requiring a composite index
      const sortedLogs = [...logs].sort((a, b) => a.hour - b.hour);
      setBreakdownLogs(sortedLogs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/heart_rate_breakdown`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Chronic Vital Logs
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'chronicVital_log'),
      orderBy('createdAt', 'desc'),
      limit(500)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChronicVitalLog));
      setChronicLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/chronicVital_log`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for AI Insights
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'ai_insights'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AIInsight));
      setAiInsights(insights);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/ai_insights`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'), 
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      // Sort client-side to avoid index requirement
      const sortedData = [...data].sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setNotifications(sortedData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/notifications`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Family Links
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'family_links'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FamilyLink));
      setFamilyLinks(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/family_links`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Risk History
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'risk_history'), 
      where('uid', '==', user.uid), 
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RiskEntry));
      // Sort client-side by date/time to avoid composite index requirement
      const sortedData = [...data].sort((a, b) => {
        const timeA = a.time?.toDate ? a.time.toDate().getTime() : 0;
        const timeB = b.time?.toDate ? b.time.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setRiskHistory(sortedData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `risk_history`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for BMI Logs
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'bmi_logs'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BMILog));
      setBmiLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/bmi_logs`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Chronic AI Insights
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'chronic_vitals_insights'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AIInsight));
      setChronicInsights(insights);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/chronic_vitals_insights`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Graph AI History
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'graph_ai_history'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GraphAIHistory));
      setGraphAIHistory(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/graph_ai_history`);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Vulnerability Alerts (Caregiver only)
  useEffect(() => {
    if (!user) {
      setVulnerabilityAlerts([]);
      return;
    }
    
    const q = query(
      collection(db, 'vulnerability_alerts'),
      where('caregiverId', '==', user.uid),
      limit(50)
    );
    
    console.log(`Setting up real-time vulnerability listener for caregiver: ${user.uid}`);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      console.log(`Received ${snapshot.docs.length} raw alerts from Firestore.`);

      const alerts = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as VulnerabilityAlert))
        .filter(a => {
          const dateRef = a.createdAt || a.timestamp;
          const time = dateRef?.toDate ? dateRef.toDate().getTime() : (dateRef ? new Date(dateRef).getTime() : 0);
          const isRecent = (now - time) < twentyFourHours;
          return isRecent;
        })
        .sort((a, b) => {
          const timeA = (a.createdAt || a.timestamp)?.toDate ? (a.createdAt || a.timestamp).toDate().getTime() : 0;
          const timeB = (b.createdAt || b.timestamp)?.toDate ? (b.createdAt || b.timestamp).toDate().getTime() : 0;
          return timeB - timeA;
        });
      
      console.log(`Filtered to ${alerts.length} recent alerts (last 24h).`);
      setVulnerabilityAlerts(alerts);
    }, (error) => {
      console.warn('Vulnerability alerts real-time fetch failed:', error);
    });
    
    return () => unsubscribe();
  }, [user]);

  return {
    heartLogs,
    chronicLogs,
    breakdownLogs,
    aiInsights,
    notifications,
    familyLinks,
    riskHistory,
    bmiLogs,
    chronicInsights,
    graphAIHistory,
    vulnerabilityAlerts
  };
}
