/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  signOut, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp,
  getDocs,
  getDocsFromServer,
  query,
  where,
  limit,
  testFirestoreConnection
} from './lib/firebase';

// Components
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { NotificationPanel } from './components/NotificationPanel';
import { StatGrid } from './components/StatGrid';
import { AIRiskHighlight } from './components/AIRiskHighlight';
import { HealthCharts } from './components/HealthCharts';
import { HistoryTab } from './components/HistoryTab';
import { ProfileTab } from './components/ProfileTab';
import { ManualVitalsModal } from './components/ManualVitalsModal';
import { NoDataModal } from './components/NoDataModal';
import { LoginPage } from './components/Auth/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Hooks & Services
import { useAuth } from './hooks/useAuth';
import { useHealthData } from './hooks/useHealthData';
import { generateAIAnalysis as callGeminiAnalysis } from './services/geminiService';

export default function App() {
  const { user, profile, loading } = useAuth();
  const {
    heartLogs,
    breakdownLogs,
    aiInsights,
    notifications,
    familyLinks,
    riskHistory
  } = useHealthData(user);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile'>('dashboard');
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showNoDataPopup, setShowNoDataPopup] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualVitals, setManualVitals] = useState({
    hr: '',
    systolic: '',
    diastolic: '',
    glucose: '',
    steps: '',
    spo2: ''
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [familyLinkStatus, setFamilyLinkStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const lastAlertedId = useRef<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Compute stats
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

  const dailyBreakdown = useMemo(() => {
    if (breakdownLogs.length > 0) {
      return Array.from({ length: 24 }, (_, hour) => {
        const found = breakdownLogs.find(b => b.hour === hour);
        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          heartRate: found ? found.heartRate : null
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
      const avg = values && values.length > 0 
        ? Math.round(values.reduce((a, b) => a + b) / values.length)
        : null;
      return { hour: `${hour.toString().padStart(2, '0')}:00`, heartRate: avg };
    });
  }, [heartLogs, breakdownLogs]);

  const periodicTrends = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekDayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const getDailyAverages = (days: number) => {
      const breakdown: Record<string, number[]> = {};
      const results = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toDateString();
        breakdown[key] = [];
        let label = days === 7 ? weekDayShort[d.getDay()] : (i === 0 ? '-30d' : (i === 14 ? '-15d' : (i === days-1 ? 'Today' : '')));
        results.push({ key, label, heartRate: null });
      }
      heartLogs.forEach(log => {
        const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        const key = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).toDateString();
        if (breakdown[key] !== undefined) breakdown[key].push(log.heartRate);
      });
      return results.map(r => {
        const vals = breakdown[r.key];
        const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b) / vals.length) : null;
        return { ...r, heartRate: avg };
      });
    };
    return { weekly: getDailyAverages(7), monthly: getDailyAverages(30) };
  }, [heartLogs]);

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
        source: 'Gemini AI Insight'
      };
    });
    return [...historicalEntries, ...aiEntries].sort((a, b) => b.sortDate - a.sortDate);
  }, [riskHistory, aiInsights]);

  // Alert Monitoring
  useEffect(() => {
    if (!user || heartLogs.length === 0) return;
    const latest = heartLogs[0];
    const logDate = latest.createdAt?.toDate ? latest.createdAt.toDate() : new Date(latest.createdAt);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const isEmergency = latest.heartRate < 40 || latest.heartRate > 130;

    if (logDate > tenMinutesAgo && isEmergency && lastAlertedId.current !== latest.id) {
      const createNotification = async () => {
        const alreadyNotified = notifications.some(n => {
          if (!n.createdAt) return false;
          const nDate = n.createdAt.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
          return n.type === 'emergency' && 
                 n.message.includes(`${latest.heartRate} BPM`) &&
                 Math.abs(nDate.getTime() - logDate.getTime()) < 60000;
        });

        if (!alreadyNotified) {
          lastAlertedId.current = latest.id;
          const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
          await setDoc(notifRef, {
            title: 'Critical Heart Rate Alert',
            message: `Emergency: Detected heart rate of ${latest.heartRate} BPM. Please seek medical help or find the nearest clinic immediately.`,
            type: 'emergency',
            read: false,
            createdAt: serverTimestamp()
          });

          familyLinks.forEach(async (link) => {
            try {
              const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
              await setDoc(familyNotifRef, {
                title: `Emergency: ${profile?.displayName || user.displayName || 'Family Member'} Alert`,
                message: `Critical: ${profile?.displayName || user.displayName || 'A family member'} has a dangerous heart rate of ${latest.heartRate} BPM. Emergency services or assistance might be needed.`,
                type: 'emergency',
                read: false,
                createdAt: serverTimestamp()
              });
            } catch (e) {
              console.warn(`Failed to alert family member ${link.email}:`, e);
            }
          });
        }
      };
      createNotification();
    }
  }, [user, heartLogs, notifications, familyLinks, profile]);

  // Actions
  const handleLogout = () => signOut(auth);
  const refreshData = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const generateAIAnalysis = async () => {
    if (!user) return;
    try {
      setIsAnalyzing(true);
      const vitals = {
        heartRate: todayStats.heartRate,
        systolic: todayStats.systolic,
        diastolic: todayStats.diastolic,
        glucose: todayStats.glucose,
        spo2: heartLogs[0]?.spo2
      };
      
      const result = await callGeminiAnalysis(vitals, profile);
      
      const insightRef = doc(collection(db, 'users', user.uid, 'ai_insights'));
      await setDoc(insightRef, {
        heartRate: todayStats.heartRate || 0,
        systolic: todayStats.systolic || null,
        diastolic: todayStats.diastolic || null,
        glucose: todayStats.glucose || null,
        risk: result.risk,
        summary: result.summary,
        advice: result.advice,
        createdAt: serverTimestamp(),
        date: serverTimestamp()
      });

      if (result.risk === 'High' || result.risk === 'Critical') {
        const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
        await setDoc(notifRef, {
          title: `AI Alert: ${result.risk} Risk Detected`,
          message: result.summary,
          type: result.risk === 'Critical' ? 'emergency' : 'warning',
          read: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) { console.error('AI Analysis failed:', e); }
    finally { setIsAnalyzing(false); }
  };

  const simulateHeartRate = async () => {
    if (!user) return;
    try {
      const logRef = doc(collection(db, 'users', user.uid, 'heart_rate_logs'));
      const rand = Math.random();
      let hrValue = rand > 0.9 ? 140 : (rand > 0.85 ? 35 : (rand > 0.8 ? 120 : (rand > 0.7 ? 105 : 72)));
      await setDoc(logRef, {
        heartRate: hrValue,
        systolic: Math.floor(Math.random() * 40) + 110,
        diastolic: Math.floor(Math.random() * 20) + 70,
        glucose: Math.floor(Math.random() * 50) + 80,
        steps: Math.floor(Math.random() * 10000),
        spo2: 98,
        createdAt: serverTimestamp()
      });
    } catch (e) { console.error(e); }
  };

  const saveManualVitals = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const logRef = doc(collection(db, 'users', user.uid, 'heart_rate_logs'));
      await setDoc(logRef, {
        heartRate: Number(manualVitals.hr) || 0,
        systolic: manualVitals.systolic ? Number(manualVitals.systolic) : null,
        diastolic: manualVitals.diastolic ? Number(manualVitals.diastolic) : null,
        glucose: manualVitals.glucose ? Number(manualVitals.glucose) : null,
        steps: Number(manualVitals.steps) || 0,
        spo2: manualVitals.spo2 ? Number(manualVitals.spo2) : null,
        createdAt: serverTimestamp()
      });
      setIsManualEntryOpen(false);
      setManualVitals({ hr: '', systolic: '', diastolic: '', glucose: '', steps: '', spo2: '' });
    } catch (e) { console.error('Manual entry failed:', e); }
    finally { setIsSyncing(false); }
  };

  const addFamilyMember = async (email: string) => {
    if (!user || !email) return;
    setFamilyLinkStatus(null);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()), limit(1));
      const snapshot = await getDocsFromServer(q);
      if (snapshot.empty) {
        setFamilyLinkStatus({ type: 'error', message: "Email not registered." });
        return;
      }
      const targetDoc = snapshot.docs[0];
      if (targetDoc.id === user.uid) {
        setFamilyLinkStatus({ type: 'error', message: "Cannot link yourself." });
        return;
      }

      await setDoc(doc(db, 'users', user.uid, 'family_links', targetDoc.id), {
        memberUid: targetDoc.id,
        displayName: targetDoc.data().displayName || 'Family Member',
        email: email.toLowerCase().trim(),
        relation: 'Family',
        status: 'active',
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'users', targetDoc.id, 'family_links', user.uid), {
        memberUid: user.uid,
        displayName: user.displayName || 'Family Member',
        email: user.email,
        relation: 'Caregiver',
        status: 'active',
        createdAt: serverTimestamp()
      });

      setFamilyLinkStatus({ type: 'success', message: "Member linked!" });
      setNewMemberEmail('');
      setIsAddingMember(false);
    } catch (e) { setFamilyLinkStatus({ type: 'error', message: "Failed logic." }); }
  };

  const findNearestClinic = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        window.open(`https://www.google.com/maps/search/medical+clinics+near+me/@${pos.coords.latitude},${pos.coords.longitude},15z`, '_blank');
      }, () => window.open('https://www.google.com/maps/search/medical+clinics+near+me/', '_blank'));
    } else window.open('https://www.google.com/maps/search/medical+clinics+near+me/', '_blank');
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    try {
      const snapshot = await getDocs(query(collection(db, 'users', user.uid, 'notifications')));
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setIsClearingAll(false);
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-minimal-bg">
      <div className="w-8 h-8 border-2 border-minimal-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-minimal-bg">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto p-4 md:p-12 max-w-6xl mx-auto relative">
          <AnimatePresence>
            {isSyncing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-minimal-bg/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-minimal-blue border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-minimal-ink">Syncing Cloud Vault...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DashboardHeader 
            user={user}
            isSyncing={isSyncing}
            isAnalyzing={isAnalyzing}
            notifications={notifications}
            onToggleNotifications={() => setIsNotificationOpen(!isNotificationOpen)}
            onRunAI={generateAIAnalysis}
            onRefresh={refreshData}
            onManualLog={() => setIsManualEntryOpen(true)}
            onSimulateLog={simulateHeartRate}
          />

          <NotificationPanel 
            notifications={notifications}
            isOpen={isNotificationOpen}
            isClearingAll={isClearingAll}
            onClose={() => setIsNotificationOpen(false)}
            onDelete={(id) => deleteDoc(doc(db, 'users', user.uid, 'notifications', id))}
            onClearAll={clearAllNotifications}
            setIsClearingAll={setIsClearingAll}
            onFindClinic={findNearestClinic}
          />

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <StatGrid todayStats={todayStats} profile={profile} />
                <AIRiskHighlight 
                  latestRisk={aiInsights[0]?.risk || riskHistory[0]?.riskLevel || 'Low'}
                  summary={aiInsights[0]?.summary || riskHistory[0]?.summary || 'Normal overview.'}
                  advice={aiInsights[0]?.advice || riskHistory[0]?.advice || ''}
                  isAnalyzing={isAnalyzing}
                  onFindClinic={findNearestClinic}
                />
                <HealthCharts 
                  chartView={chartView} 
                  setChartView={setChartView} 
                  data={chartView === 'daily' ? dailyBreakdown : (chartView === 'weekly' ? periodicTrends.weekly : periodicTrends.monthly)} 
                />
              </motion.div>
            )}

            {activeTab === 'history' && <HistoryTab history={unifiedHistory} />}

            {activeTab === 'profile' && (
              <ProfileTab 
                profile={profile}
                familyLinks={familyLinks}
                isAddingMember={isAddingMember}
                setIsAddingMember={setIsAddingMember}
                newMemberEmail={newMemberEmail}
                setNewMemberEmail={setNewMemberEmail}
                onAddMember={addFamilyMember}
                familyLinkStatus={familyLinkStatus}
                setFamilyLinkStatus={setFamilyLinkStatus}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <ManualVitalsModal 
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        vitals={manualVitals}
        setVitals={setManualVitals}
        onSave={saveManualVitals}
      />

      <NoDataModal isOpen={showNoDataPopup} onClose={() => setShowNoDataPopup(false)} />
    </ErrorBoundary>
  );
}
