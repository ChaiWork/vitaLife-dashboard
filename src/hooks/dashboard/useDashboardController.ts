import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  getDocsFromServer
} from '../../lib/firebase';
import { UserProfile, AuthUser, FamilyLink } from '../../types';
import { useHealthData } from '../useHealthData';
import { generateAIAnalysis as callGeminiAnalysis } from '../../services/geminiService';
import { useDashboardData } from './useDashboardData';

export function useDashboardController(user: AuthUser, profile: UserProfile | null) {
  const healthData = useHealthData(user);
  const {
    heartLogs,
    chronicLogs,
    breakdownLogs,
    aiInsights,
    notifications,
    familyLinks,
    riskHistory,
    bmiLogs,
    chronicInsights
  } = healthData;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile' | 'caregiver' | 'settings'>('dashboard');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeMetric, setActiveMetric] = useState<'heartRate' | 'bloodPressure' | 'bloodGlucose' | 'bmi'>('heartRate');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [heartAnalysis, setHeartAnalysis] = useState<{ risk: "Low" | "Moderate" | "High" | "Critical", summary: string, advice: string } | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showNoDataPopup, setShowNoDataPopup] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualVitals, setManualVitals] = useState({ systolic: '', diastolic: '', glucose: '', spo2: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [familyLinkStatus, setFamilyLinkStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isChronicAnalyzing, setIsChronicAnalyzing] = useState(false);
  const [chronicAnalysis, setChronicAnalysis] = useState<{ risk: "Low" | "Moderate" | "High" | "Critical", summary: string, advice: string } | null>(null);
  const lastAlertedId = useRef<string | null>(null);

  const { todayStats, dailyBreakdown, periodicTrends, unifiedHistory } = useDashboardData(healthData);

  const generateHeartAnalysis = async () => {
    if (!user || isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      const vitals = { heartRate: todayStats.heartRate };
      const result = await callGeminiAnalysis(vitals, profile);
      setHeartAnalysis(result);
      
      const insightRef = doc(collection(db, 'users', user.uid, 'ai_insights'));
      await setDoc(insightRef, {
        ...vitals,
        ...result,
        createdAt: serverTimestamp(),
        date: serverTimestamp()
      });

      const historyRef = doc(collection(db, 'risk_history'));
      await setDoc(historyRef, {
        uid: user.uid,
        riskLevel: result.risk,
        summary: result.summary,
        advice: result.advice,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date().toLocaleDateString(),
        time: serverTimestamp(),
        vitals: vitals,
        source: 'Heart AI Analysis'
      });

      if (['Moderate', 'High', 'Critical'].includes(result.risk)) {
        const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
        await setDoc(notifRef, {
          title: `Heart AI Alert: ${result.risk} Risk`,
          message: result.summary,
          type: result.risk === 'Critical' ? 'emergency' : 'warning',
          read: false,
          createdAt: serverTimestamp()
        });

        familyLinks.forEach(async (link) => {
          try {
            const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
            await setDoc(familyNotifRef, {
              title: `AI Health Alert: ${profile?.fullName || user.displayName || 'Family Member'} - ${result.risk} Risk`,
              message: `Heart AI: ${result.summary}`,
              type: result.risk === 'Critical' ? 'emergency' : 'warning',
              read: false,
              createdAt: serverTimestamp()
            });
          } catch (e) { console.warn('Failed to forward notif:', e); }
        });
      }
    } catch (e) { console.error('AI Analysis failed:', e); }
    finally { 
      setIsAnalyzing(false);
      setLastAnalysisTime(new Date());
    }
  };

  const generateChronicAnalysis = async () => {
    if (!user || isChronicAnalyzing) return;
    try {
      setIsChronicAnalyzing(true);
      const vitals = {
        heartRate: todayStats.heartRate,
        systolic: todayStats.systolic,
        diastolic: todayStats.diastolic,
        glucose: todayStats.glucose,
        spo2: todayStats.spo2 ?? 98
      };
      
      const result = await callGeminiAnalysis(vitals, profile);
      setChronicAnalysis(result);
      
      // Separate collection for chronic to "wait for manual" logic
      const insightRef = doc(collection(db, 'users', user.uid, 'chronic_vitals_insights'));
      await setDoc(insightRef, {
        ...vitals,
        ...result,
        source: 'Chronic Manual Log',
        createdAt: serverTimestamp()
      });

      const historyRef = doc(collection(db, 'risk_history'));
      await setDoc(historyRef, {
        uid: user.uid,
        riskLevel: result.risk,
        summary: result.summary,
        advice: result.advice,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + new Date().toLocaleDateString(),
        time: serverTimestamp(),
        vitals: vitals,
        source: 'Chronic Analysis'
      });

      if (['Moderate', 'High', 'Critical'].includes(result.risk)) {
        const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
        await setDoc(notifRef, {
          title: `Health Insight: ${result.risk} Risk Detected`,
          message: result.summary,
          type: result.risk === 'Critical' ? 'emergency' : 'warning',
          read: false,
          createdAt: serverTimestamp()
        });

        // Forward to family circle
        familyLinks.forEach(async (link) => {
          try {
            const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
            await setDoc(familyNotifRef, {
              title: `AI Health Alert: ${profile?.fullName || user.displayName || 'Family Member'} - ${result.risk} Risk`,
              message: `Chronic AI Summary: ${result.summary}`,
              type: result.risk === 'Critical' ? 'emergency' : 'warning',
              read: false,
              createdAt: serverTimestamp()
            });
          } catch (e) { console.warn('Failed to forward notif:', e); }
        });
      }
    } catch (e) { console.error('Chronic AI failed:', e); }
    finally { 
      setIsChronicAnalyzing(false);
      setLastAnalysisTime(new Date());
    }
  };

  const simulateHeartRate = async () => {
    if (!user) return;
    try {
      const hrRef = doc(collection(db, 'users', user.uid, 'heart_rate_logs'));
      const chronicRef = doc(collection(db, 'users', user.uid, 'chronicVital_log'));
      
      const rand = Math.random();
      let hrValue = rand > 0.9 ? 140 : (rand > 0.85 ? 35 : (rand > 0.7 ? 105 : 72));
      
      await Promise.all([
        setDoc(hrRef, {
          heartRate: hrValue,
          steps: Math.floor(Math.random() * 10000),
          createdAt: serverTimestamp()
        }),
        setDoc(chronicRef, {
          systolic: Math.floor(Math.random() * 40) + 110,
          diastolic: Math.floor(Math.random() * 20) + 70,
          glucose: Math.floor(Math.random() * 50) + 80,
          spo2: Math.floor(Math.random() * 3) + 96,
          createdAt: serverTimestamp()
        })
      ]);
    } catch (e) { console.error(e); }
  };

  const saveManualVitals = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const logRef = doc(collection(db, 'users', user.uid, 'chronicVital_log'));
      await setDoc(logRef, {
        systolic: manualVitals.systolic ? Number(manualVitals.systolic) : 120,
        diastolic: manualVitals.diastolic ? Number(manualVitals.diastolic) : 80,
        glucose: manualVitals.glucose ? Number(manualVitals.glucose) : 95,
        spo2: manualVitals.spo2 ? Number(manualVitals.spo2) : 98,
        createdAt: serverTimestamp()
      });
      setIsManualEntryOpen(false);
      setManualVitals({ systolic: '', diastolic: '', glucose: '', spo2: '' });
      await generateChronicAnalysis();
    } catch (e) { console.error('Manual entry failed:', e); }
    finally { setIsSyncing(false); }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const hVal = updates.height !== undefined ? updates.height : profile?.height;
      const wVal = updates.weight !== undefined ? updates.weight : profile?.weight;
      
      const h = Number(hVal);
      const w = Number(wVal);
      
      // ENSURE BMI is recalculated if both are valid numbers
      if (h > 0 && w > 0) {
        const heightMeters = h / 100;
        const bmiValue = Number((w / (heightMeters * heightMeters)).toFixed(1));
        
        // Log BMI update explicitly
        const bmiRef = doc(collection(db, 'users', user.uid, 'bmi_logs'));
        await setDoc(bmiRef, {
          bmi: bmiValue,
          weight: Number(w),
          height: Number(h),
          createdAt: serverTimestamp()
        });
        
        // Update user profile with new BMI
        await setDoc(doc(db, 'users', user.uid), { ...updates, bmi: bmiValue }, { merge: true });
      } else {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      }
    } catch (e) { console.error('Update profile failed:', e); }
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

  const clearAllNotifications = async () => {
    if (!user) return;
    try {
      setIsClearingAll(true);
      const batch = writeBatch(db);
      notifications.forEach(n => batch.delete(doc(db, 'users', user.uid, 'notifications', n.id)));
      await batch.commit();
      setIsClearingAll(false);
    } catch (e) { console.error(e); }
  };

  return {
    // Selection state
    activeTab, setActiveTab,
    fontSize, setFontSize,
    chartView, setChartView,
    activeMetric, setActiveMetric,
    
    // Status state
    isSyncing, isAnalyzing, isChronicAnalyzing, isNotificationOpen, setIsNotificationOpen,
    showNoDataPopup, setShowNoDataPopup, 
    isAddingMember, setIsAddingMember,
    isManualEntryOpen, setIsManualEntryOpen,
    isClearingAll,
    
    // Form state
    manualVitals, setManualVitals,
    newMemberEmail, setNewMemberEmail,
    familyLinkStatus, setFamilyLinkStatus,
    
    // Analysis results
    heartAnalysis, chronicAnalysis,
    lastAnalysisTime,
    
    // Derived/Fetched Data
    todayStats, dailyBreakdown, periodicTrends, unifiedHistory,
    heartLogs, chronicLogs, bmiLogs, aiInsights, chronicles: chronicInsights, 
    notifications, familyLinks, riskHistory,
    
    // Actions
    generateChronicAnalysis,
    saveManualVitals,
    simulateHeartRate,
    updateProfile,
    addFamilyMember,
    clearAllNotifications,
    lastAlertedId
  };
}
