/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Plus, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  onAuthStateChanged, 
  signOut,
  User,
} from './lib/firebase';

import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { HistoryTab } from './components/HistoryTab';
import { ProfileTab } from './components/ProfileTab';
import { ManualEntryModal } from './components/ManualEntryModal';
import { NotificationPanel } from './components/NotificationPanel';
import { MetricCharts } from './components/MetricCharts';

import { useHealthData } from './hooks/useHealthData';
import * as healthService from './services/healthService';
import { Tab, ChartView } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [chartView, setChartView] = useState<ChartView>('daily');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showNoDataPopup, setShowNoDataPopup] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
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

  const {
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
  } = useHealthData(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      
      // If user logs in and has no data, show popup
      if (u && heartLogs.length === 0 && !loading) {
        setTimeout(() => setShowNoDataPopup(true), 3000);
      }
    });
    return () => unsubscribe();
  }, [heartLogs.length, loading]);

  const handleLogout = () => signOut(auth);

  const findNearestClinic = () => {
    window.open('https://www.google.com/maps/search/clinic+near+me', '_blank');
  };

  const handleSaveManualVitals = async () => {
    if (!user) return;
    try {
      await healthService.saveManualVitals(user.uid, manualVitals);
      setIsManualEntryOpen(false);
      setManualVitals({ hr: '', systolic: '', diastolic: '', glucose: '', steps: '', spo2: '' });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFamilyMember = async (email: string) => {
    if (!user) return;
    try {
      await healthService.addFamilyMember(user.uid, user.email || '', email);
      setFamilyLinkStatus({ type: 'success', message: 'Family member linked successfully!' });
      setNewMemberEmail('');
      setTimeout(() => {
        setIsAddingMember(false);
        setFamilyLinkStatus(null);
      }, 2000);
    } catch (e: any) {
      setFamilyLinkStatus({ type: 'error', message: e.message || 'Failed to link member.' });
    }
  };

  const generateAIAnalysis = async () => {
    if (!user) return;
    try {
      setIsAnalyzing(true);
      const { functions, httpsCallable } = await import('./lib/firebase');
      const chronicAnalysisFn = httpsCallable(functions, 'chronicAnalysis', { timeout: 60000 });
      await chronicAnalysisFn({
        systolic: todayStats.systolic ? Number(todayStats.systolic) : undefined,
        diastolic: todayStats.diastolic ? Number(todayStats.diastolic) : undefined,
        glucose: todayStats.glucose ? Number(todayStats.glucose) : undefined,
        heartRate: todayStats.heartRate ? Number(todayStats.heartRate) : undefined
      });
      // Insight will be saved to Firestore by Cloud Function or we refresh
      refreshData();
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-minimal-bg">
        <div className="w-8 h-8 border-2 border-minimal-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!user ? (
        <LoginPage />
      ) : (
        <div className="min-h-screen flex bg-minimal-bg">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

          <main className="flex-1 overflow-y-auto p-4 md:p-12 max-w-6xl mx-auto relative">
            <AnimatePresence>
              {isSyncing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-minimal-bg/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                >
                  <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl relative">
                    <div className="w-10 h-10 border-4 border-minimal-blue border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-minimal-ink tracking-tight">Syncing Health Metrics...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ManualEntryModal 
              isOpen={isManualEntryOpen} 
              onClose={() => setIsManualEntryOpen(false)} 
              vitals={manualVitals} 
              setVitals={setManualVitals} 
              onSave={handleSaveManualVitals} 
            />

            <AnimatePresence>
              {showNoDataPopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-minimal-ink/40 backdrop-blur-md">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-panel p-10 rounded-[40px] max-w-md w-full text-center shadow-3xl"
                  >
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-100">
                      <Heart className="text-amber-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 tracking-tight text-minimal-ink">No Health Data Detected</h3>
                    <p className="text-minimal-muted mb-8 text-sm leading-relaxed">
                      We couldn't find any recent vitals. Ensure your smart device is synced.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => { setShowNoDataPopup(false); setIsManualEntryOpen(true); }}
                        className="w-full py-4 bg-minimal-ink text-white rounded-2xl font-bold text-sm shadow-xl shadow-minimal-ink/20 transform transition-all active:scale-95"
                      >
                        Enter Manually
                      </button>
                      <button 
                        onClick={() => setShowNoDataPopup(false)}
                        className="w-full py-4 bg-white border border-minimal-border text-minimal-muted rounded-2xl font-bold text-sm hover:bg-minimal-bg transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <Header 
              user={user} 
              activeTab={activeTab} 
              isSyncing={isSyncing} 
              refreshData={refreshData} 
              notifications={notifications}
              isNotificationOpen={isNotificationOpen}
              setIsNotificationOpen={setIsNotificationOpen}
            />

            <AnimatePresence>
              {isNotificationOpen && (
                <NotificationPanel 
                  notifications={notifications}
                  isClearingAll={isClearingAll}
                  setIsClearingAll={setIsClearingAll}
                  onClose={() => setIsNotificationOpen(false)}
                  onClearAll={() => healthService.clearAllNotifications(user.uid, notifications)}
                  onDelete={(id) => healthService.deleteNotification(user.uid, id)}
                  onMarkRead={() => healthService.markAllNotificationsRead(user.uid, notifications)}
                  onFindClinic={findNearestClinic}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <DashboardTab 
                    todayStats={todayStats} 
                    profile={profile} 
                    aiInsights={aiInsights} 
                    isAnalyzing={isAnalyzing} 
                    onFindClinic={findNearestClinic} 
                  />
                  <MetricCharts 
                    chartView={chartView} 
                    setChartView={setChartView} 
                    dailyBreakdown={dailyBreakdown} 
                    periodicTrends={periodicTrends} 
                  />
                  <div className="flex justify-center pt-8 border-t border-minimal-border">
                    <button 
                      onClick={generateAIAnalysis}
                      disabled={isAnalyzing || !todayStats.hasDataToday}
                      className="bg-minimal-ink text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transform transition-all active:scale-95"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing Chronic Vitals...
                        </>
                      ) : (
                        <>
                          Re-run AI Vitals Analysis
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'history' && <HistoryTab unifiedHistory={unifiedHistory} />}
              {activeTab === 'profile' && (
                <ProfileTab 
                  profile={profile}
                  familyLinks={familyLinks}
                  isAddingMember={isAddingMember}
                  setIsAddingMember={setIsAddingMember}
                  newMemberEmail={newMemberEmail}
                  setNewMemberEmail={setNewMemberEmail}
                  familyLinkStatus={familyLinkStatus}
                  setFamilyLinkStatus={setFamilyLinkStatus}
                  deletingMemberId={deletingMemberId}
                  setDeletingMemberId={setDeletingMemberId}
                  onAddMember={handleAddFamilyMember}
                  onRemoveMember={(mid) => healthService.removeFamilyMember(user.uid, mid)}
                  onUpdateProfile={(data) => healthService.updateProfile(user.uid, data)}
                />
              )}
            </AnimatePresence>
          </main>

          {/* Quick Action FAB for mobile */}
          <button 
            onClick={() => setIsManualEntryOpen(true)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-minimal-ink text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      )}
    </ErrorBoundary>
  );
}
