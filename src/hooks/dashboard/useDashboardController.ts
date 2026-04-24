import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  updateDoc,
  serverTimestamp,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  getDocsFromServer,
  handleFirestoreError,
  OperationType
} from '../../lib/firebase';
import { UserProfile, AuthUser, FamilyLink } from '../../types';
import { useHealthData } from '../useHealthData';
import { 
  generateAIAnalysis as callGeminiAnalysis,
  generateHealthAnalysis as callHealthAnalysis
} from '../../services/geminiService';
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
    chronicInsights,
    graphAIHistory,
    vulnerabilityAlerts
  } = healthData;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile' | 'caregiver' | 'settings' | 'aiHistory'>('dashboard');
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
  const [manualVitals, setManualVitals] = useState({ systolic: '', diastolic: '', glucose: '', spo2: '', heartRate: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [familyLinkStatus, setFamilyLinkStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isChronicAnalyzing, setIsChronicAnalyzing] = useState(false);
  const [chronicAnalysis, setChronicAnalysis] = useState<{ risk: "Low" | "Moderate" | "High" | "Critical", summary: string, advice: string } | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const lastAlertedId = useRef<string | null>(null);
  const analyzedLogIds = useRef<Set<string>>(new Set());
  const analysisInProgress = useRef(false);
  const lastAutoAnalysisTime = useRef<number>(0);
  const lastAnalyzedHR = useRef<number>(0);

  const { todayStats, dailyBreakdown, periodicTrends, unifiedHistory } = useDashboardData(healthData);

  const generateHeartAnalysis = async (vitalsToAnalyze?: { heartRate: number, timestamp?: any, logId?: string }) => {
    if (!user || isAnalyzing || analysisInProgress.current) return;
    
    // Rule: Don't re-analyze the same log ID in this session
    if (vitalsToAnalyze?.logId && analyzedLogIds.current.has(vitalsToAnalyze.logId)) {
      return;
    }
    
    setAnalysisMessage(null);
    
    try {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      // Find the latest log
      const latestLog = heartLogs[0];
      const logTime = latestLog?.createdAt?.toDate ? latestLog.createdAt.toDate().getTime() : 0;
      const isOutdated = (now - logTime) > twentyFourHours;

      // Rule: If already analyzed -> skip processing (for manual trigger or auto)
      if ((latestLog?.analyzed || (latestLog?.id && analyzedLogIds.current.has(latestLog.id))) && !vitalsToAnalyze) {
        setAnalysisMessage("Latest heart rate log has already been analyzed. Please record a new heart rate for new insights.");
        setShowNoDataPopup(true);
        return;
      }

      // Rule: If log is older than the allowed time window (24h) -> do NOT analyze
      if (!vitalsToAnalyze && (!latestLog || isOutdated)) {
        setAnalysisMessage("This heart rate data is outdated. Please log a new heart rate to receive updated health insights.");
        setShowNoDataPopup(true);
        return;
      }

      // Additional safeguard for auto-trigger
      if (vitalsToAnalyze && now - lastAutoAnalysisTime.current < 15000) {
        return;
      }

      setIsAnalyzing(true);
      analysisInProgress.current = true;
      
      const vitals = vitalsToAnalyze || { 
        heartRate: latestLog?.heartRate || 72,
        timestamp: latestLog?.createdAt || serverTimestamp(),
        logId: latestLog?.id
      };
      
      if (vitals.logId) analyzedLogIds.current.add(vitals.logId);
      
      console.log(`Starting Heart Intelligence Analysis for HR: ${vitals.heartRate}`);

      if (vitalsToAnalyze) {
        lastAutoAnalysisTime.current = now;
        lastAnalyzedHR.current = vitals.heartRate;
      }

      const result = await callHealthAnalysis({ heartRate: vitals.heartRate });
      setHeartAnalysis(result);
      
      // Store result
      const insightRef = doc(collection(db, 'users', user.uid, 'ai_insights'));
      await setDoc(insightRef, {
        heartRate: vitals.heartRate,
        ...result,
        createdAt: serverTimestamp(),
        date: vitals.timestamp || serverTimestamp(),
        isAutoTriggered: !!vitalsToAnalyze
      });

      // Mark the record as analyzed
      if (vitals.logId) {
        const logRef = doc(db, 'users', user.uid, 'heart_rate_logs', vitals.logId);
        await updateDoc(logRef, { analyzed: true }).catch(() => {});
      }

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
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `risk_history`));

      const normalizedRisk = result.risk.toLowerCase();
      if (['moderate', 'high', 'critical'].includes(normalizedRisk)) {
        const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
        await setDoc(notifRef, {
          title: `Heart AI Alert: ${result.risk} Risk`,
          message: result.summary,
          type: normalizedRisk === 'critical' ? 'emergency' : 'warning',
          read: false,
          createdAt: serverTimestamp()
        });

        familyLinks.forEach(async (link) => {
          try {
            const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
            await setDoc(familyNotifRef, {
              title: `AI Health Alert: ${profile?.fullName || user.displayName || 'Unknown Patient'} - ${result.risk} Risk`,
              message: `Heart AI: ${result.summary}`,
              type: normalizedRisk === 'critical' ? 'emergency' : 'warning',
              read: false,
              createdAt: serverTimestamp()
            });
          } catch (e) { console.warn('Failed to forward notif:', e); }
        });
      }
    } catch (e) { console.error('AI Analysis failed:', e); }
    finally { 
      setIsAnalyzing(false);
      analysisInProgress.current = false;
      setLastAnalysisTime(new Date());
    }
  };

  const generateChronicAnalysis = async () => {
    if (!user || isChronicAnalyzing) return;
    setAnalysisMessage(null);
    
    try {
      // Check recency of relevant logs
      const latestHrLog = heartLogs[0];
      const latestChronicLog = chronicLogs[0];
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      const hrLogTime = latestHrLog?.createdAt?.toDate ? latestHrLog.createdAt.toDate().getTime() : 0;
      const chronicLogTime = latestChronicLog?.createdAt?.toDate ? latestChronicLog.createdAt.toDate().getTime() : 0;
      
      const isOutdated = (now - hrLogTime) > twentyFourHours || (now - chronicLogTime) > twentyFourHours;

      if (!latestHrLog || !latestChronicLog || isOutdated) {
        setAnalysisMessage("No recent health data found (BP/Glucose/HR) within the last 24 hours. Please log new readings to generate updated chronic insights.");
        setShowNoDataPopup(true);
        return;
      }

      setIsChronicAnalyzing(true);
      const vitals = {
        heartRate: latestHrLog.heartRate,
        systolic: latestChronicLog.systolic,
        diastolic: latestChronicLog.diastolic,
        glucose: latestChronicLog.glucose,
        spo2: latestChronicLog.spo2 ?? 98
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
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/chronic_vitals_insights`));

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
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `risk_history`));

      const normalizedChronicRisk = result.risk.toLowerCase();
      if (['moderate', 'high', 'critical'].includes(normalizedChronicRisk)) {
        const notifRef = doc(collection(db, 'users', user.uid, 'notifications'));
        await setDoc(notifRef, {
          title: `Health Insight: ${result.risk} Risk Detected`,
          message: result.summary,
          type: normalizedChronicRisk === 'critical' ? 'emergency' : 'warning',
          read: false,
          createdAt: serverTimestamp()
        });

      // Forward to family circle
      familyLinks.forEach(async (link) => {
        try {
          // Create vulnerability alert record for caregivers to see in dashboard
          const alertRef = doc(collection(db, 'vulnerability_alerts'));
          await setDoc(alertRef, {
            patientId: user.uid,
            patientFullName: profile?.fullName || user.displayName || 'Unknown Patient',
            caregiverId: link.memberUid,
            createdAt: serverTimestamp(),
            timestamp: serverTimestamp(),
            alertType: "HR_ANOMALY",
            status: "critical"
          });

          const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
            await setDoc(familyNotifRef, {
              title: `AI Health Alert: ${profile?.fullName || user.displayName || 'Unknown Patient'} - ${result.risk} Risk`,
              message: `Chronic AI Summary: ${result.summary}`,
              type: normalizedChronicRisk === 'critical' ? 'emergency' : 'warning',
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

      // Trigger analyses immediately after simulation
      generateHeartAnalysis();
      generateChronicAnalysis();
    } catch (e) { console.error(e); }
  };

  const saveManualVitals = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      
      const batch = writeBatch(db);
      
      // 1. Save Chronic Vitals (BP, Glucose, SpO2)
      const chronicRef = doc(collection(db, 'users', user.uid, 'chronicVital_log'));
      batch.set(chronicRef, {
        systolic: manualVitals.systolic ? Number(manualVitals.systolic) : 120,
        diastolic: manualVitals.diastolic ? Number(manualVitals.diastolic) : 80,
        glucose: manualVitals.glucose ? Number(manualVitals.glucose) : 95,
        spo2: manualVitals.spo2 ? Number(manualVitals.spo2) : 98,
        createdAt: serverTimestamp()
      });

      // 2. Save Heart Rate if provided
      if (manualVitals.heartRate) {
        const hrRef = doc(collection(db, 'users', user.uid, 'heart_rate_logs'));
        batch.set(hrRef, {
          heartRate: Number(manualVitals.heartRate),
          steps: todayStats.steps || 0,
          createdAt: serverTimestamp(),
          source: 'manual'
        });
      }

      await batch.commit();
      
      setIsManualEntryOpen(false);
      setManualVitals({ systolic: '', diastolic: '', glucose: '', spo2: '', heartRate: '' });
      
      // Trigger analyses immediately
      await Promise.all([
        generateHeartAnalysis(),
        generateChronicAnalysis()
      ]);
    } catch (e) { 
      console.error('Manual entry failed:', e);
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/vitals_save`);
    }
    finally { setIsSyncing(false); }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const hVal = updates.height !== undefined ? updates.height : profile?.height;
      const wVal = updates.weight !== undefined ? updates.weight : profile?.weight;
      
      const h = Number(hVal);
      const w = Number(wVal);
      
      // ENSURE identity fields are always included to satisfy 'isValidUser' rule if this is a first-time setup
      const baseUpdates = {
        ...updates,
        uid: user.uid,
        email: user.email,
        updatedAt: serverTimestamp()
      };
      
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
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/bmi_logs`));
        
        // Update user profile with new BMI
        await setDoc(doc(db, 'users', user.uid), { ...baseUpdates, bmi: bmiValue }, { merge: true });
      } else {
        await setDoc(doc(db, 'users', user.uid), baseUpdates, { merge: true });
      }
    } catch (e) { 
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
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
        displayName: targetDoc.data().fullName || targetDoc.data().displayName || 'Family Member',
        email: email.toLowerCase().trim(),
        relation: 'Family',
        status: 'active',
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/family_links`));

      await setDoc(doc(db, 'users', targetDoc.id, 'family_links', user.uid), {
        memberUid: user.uid,
        displayName: profile?.fullName || user.displayName || 'Family Member',
        email: user.email,
        relation: 'Caregiver',
        status: 'active',
        createdAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${targetDoc.id}/family_links`));

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

  const deleteGraphAIHistory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'graph_ai_history', id));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const latestLog = heartLogs[0];
    if (!latestLog || latestLog.analyzed) return;
    
    const hr = latestLog.heartRate;
    if (!hr || hr === 0) return;

    // Trigger analysis for new logs (Manual or Syced from Phone)
    const timer = setTimeout(() => {
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      const logTime = latestLog.createdAt?.toDate ? latestLog.createdAt.toDate().getTime() : now;
      
      // Cooldown check (15 seconds for any auto-trigger to prevent loops)
      const timeSinceLast = now - lastAutoAnalysisTime.current;
      const isDuplicateValue = Math.abs(lastAnalyzedHR.current - hr) < 2 && timeSinceLast < 60000;
      const isOutdated = (now - logTime) > tenMinutes;
      
      // Final check: ensure we aren't analyzing and it's within 10min window
      if (!isAnalyzing && !analysisInProgress.current && timeSinceLast > 15000 && !isDuplicateValue && !isOutdated) {
        console.log(`Auto-triggering Heart Intelligence for new/synced HR: ${hr}`);
        generateHeartAnalysis({ 
          heartRate: hr, 
          timestamp: latestLog.createdAt, 
          logId: latestLog.id 
        });
      }
    }, 3000); // 3s delay to allow batching/settling
    return () => clearTimeout(timer);
  }, [heartLogs, isAnalyzing, user?.uid]);

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
    isClearingAll, setIsClearingAll,
    
    // Form state
    manualVitals, setManualVitals,
    newMemberEmail, setNewMemberEmail,
    familyLinkStatus, setFamilyLinkStatus,
    
    // Analysis results
    heartAnalysis, chronicAnalysis,
    lastAnalysisTime,
    analysisMessage, setAnalysisMessage,
    
    // Derived/Fetched Data
    todayStats, dailyBreakdown, periodicTrends, unifiedHistory,
    heartLogs, chronicLogs, bmiLogs, aiInsights, chronicles: chronicInsights, graphAIHistory,
    notifications, familyLinks, riskHistory, vulnerabilityAlerts,
    
    // Actions
    generateHeartAnalysis,
    generateChronicAnalysis,
    saveManualVitals,
    simulateHeartRate,
    updateProfile,
    addFamilyMember,
    clearAllNotifications,
    deleteGraphAIHistory,

    triggerSOS: async () => {
      if (!user) {
        console.error('SOS Trigger Failed: No authenticated user found.');
        return;
      }
      console.log('SOS Button Pressed. Starting trigger sequence...');
      try {
        const fullName = profile?.fullName || user.displayName || user.email || 'Unknown Patient';
        
        if (familyLinks.length === 0) {
          console.warn('No family links found for this user. Alert may not be visible to any caregiver.');
          // Create a self-alert or a general alert just in case
          const alertRef = doc(collection(db, 'vulnerability_alerts'));
          await setDoc(alertRef, {
            patientId: user.uid,
            patientFullName: fullName,
            caregiverId: 'ALL', // Global or fallback
            alertType: "SOS_EMERGENCY",
            status: "critical",
            createdAt: serverTimestamp(),
            timestamp: serverTimestamp()
          });
        }

        // Create an alert record for each linked caregiver/member
        for (const link of familyLinks) {
          try {
            const alertRef = doc(collection(db, 'vulnerability_alerts'));
            await setDoc(alertRef, {
              patientId: user.uid,
              patientFullName: fullName,
              caregiverId: link.memberUid,
              alertType: "SOS_EMERGENCY",
              status: "critical",
              createdAt: serverTimestamp(),
              timestamp: serverTimestamp()
            });
            console.log(`SOS Alert Created successfully in Firestore for Caregiver: ${link.memberUid}`);
            
            // Also push a manual notification
            const familyNotifRef = doc(collection(db, 'users', link.memberUid, 'notifications'));
            await setDoc(familyNotifRef, {
              title: `CRITICAL SOS: ${fullName}`,
              message: `${fullName} has triggered an Emergency SOS! Immediate action required.`,
              type: 'emergency',
              read: false,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.warn('Failed to notify member:', link.memberUid, e);
          }
        }

        alert('EMERGENCY SOS TRIGGERED! Your caregivers have been notified.');
        console.log('SOS Trigger sequence completed successfully.');
      } catch (e) {
        console.error('SOS Trigger failed at top level:', e);
        alert('Failed to trigger SOS. Please check your connection.');
      }
    },

    deleteUnifiedHistory: async (id: string, source: string) => {
      if (!user) return;
      try {
        let collectionRef;
        if (source === 'Heart AI' || source === 'Chronic AI') {
          collectionRef = collection(db, 'users', user.uid, 'ai_insights');
        } else if (source === 'Chronic Analysis') {
          collectionRef = collection(db, 'risk_history');
        } else if (source === 'Metabolic Insight') {
          collectionRef = collection(db, 'users', user.uid, 'chronic_vitals_insights');
        } else {
          return;
        }
        await deleteDoc(doc(collectionRef, id));
      } catch (e) {
        console.error('Failed to delete history item:', e);
      }
    },

    lastAlertedId
  };
}
