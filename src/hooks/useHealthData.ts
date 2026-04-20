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
  HeartRateBreakdown, 
  AIInsight, 
  Notification, 
  FamilyLink, 
  RiskEntry,
  AuthUser
} from '../types';

export function useHealthData(user: AuthUser | null) {
  const [heartLogs, setHeartLogs] = useState<HeartRateLog[]>([]);
  const [breakdownLogs, setBreakdownLogs] = useState<HeartRateBreakdown[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([]);
  const [riskHistory, setRiskHistory] = useState<RiskEntry[]>([]);

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
      orderBy('hour', 'asc'),
      limit(24)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HeartRateBreakdown));
      setBreakdownLogs(logs);
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
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(data);
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
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Risk History
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'risk_history'), where('uid', '==', user.uid), orderBy('date', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RiskEntry));
      setRiskHistory(data);
    });
    return () => unsubscribe();
  }, [user]);

  return {
    heartLogs,
    breakdownLogs,
    aiInsights,
    notifications,
    familyLinks,
    riskHistory
  };
}
