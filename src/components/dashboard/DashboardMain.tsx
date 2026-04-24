import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../layout/Sidebar';
import { DashboardHeader } from '../layout/DashboardHeader';
import { LayoutDashboard, Users, History, HeartHandshake, Settings as SettingsIcon, Brain } from 'lucide-react';
import { NotificationPanel } from '../layout/NotificationPanel';
import { StatGrid } from './StatGrid';
import { AIRiskHighlight } from './AIRiskHighlight';
import { HealthCharts } from './HealthCharts';
import { ChronicAIAnalysis } from './ChronicAIAnalysis';
import { GraphAIIntelligence } from './GraphAIIntelligence';
import { HistoryTab } from '../tabs/HistoryTab';
import { AIHistoryTab } from '../tabs/AIHistoryTab';
import { ProfileTab } from '../tabs/ProfileTab';
import { CaregiverView } from '../tabs/CaregiverView';
import { SettingsTab } from '../tabs/SettingsTab';
import { ManualVitalsModal } from '../modals/ManualVitalsModal';
import { NoDataModal } from '../modals/NoDataModal';
import { useDashboardController } from '../../hooks/dashboard/useDashboardController';
import { AuthUser, UserProfile } from '../../types';
import { doc, deleteDoc, db, auth, signOut } from '../../lib/firebase';

interface DashboardMainProps {
  user: AuthUser;
  profile: UserProfile | null;
}

const MobileNavButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all relative ${active ? 'text-minimal-blue bg-minimal-blue/5' : 'text-minimal-muted'}`}
  >
    {active && (
      <motion.div 
        layoutId="mobileActiveNav"
        className="absolute inset-0 bg-minimal-blue/5 rounded-2xl ring-1 ring-minimal-blue/10"
      />
    )}
    <div className={`relative z-10 transition-transform ${active ? 'scale-110' : ''}`}>
      {icon}
    </div>
  </button>
);

export const DashboardMain: React.FC<DashboardMainProps> = ({ user, profile }) => {
  const controller = useDashboardController(user, profile);
  const {
    activeTab, setActiveTab,
    fontSize, setFontSize,
    chartView, setChartView,
    activeMetric, setActiveMetric,
    isSyncing, isAnalyzing, isChronicAnalyzing, isNotificationOpen, setIsNotificationOpen,
    showNoDataPopup, setShowNoDataPopup,
    isAddingMember, setIsAddingMember,
    isManualEntryOpen, setIsManualEntryOpen,
    isClearingAll, setIsClearingAll,
    manualVitals, setManualVitals,
    newMemberEmail, setNewMemberEmail,
    familyLinkStatus, setFamilyLinkStatus,
    heartAnalysis, chronicAnalysis,
    lastAnalysisTime,
    todayStats, dailyBreakdown, periodicTrends, unifiedHistory,
    heartLogs, chronicLogs, bmiLogs, aiInsights, chronicles, graphAIHistory,
    notifications, familyLinks, riskHistory, vulnerabilityAlerts,
    generateHeartAnalysis,
    generateChronicAnalysis,
    saveManualVitals,
    simulateHeartRate,
    updateProfile,
    addFamilyMember,
    clearAllNotifications,
    deleteGraphAIHistory,
    triggerSOS
  } = controller;

  const findNearestClinic = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        window.open(`https://www.google.com/maps/search/medical+clinics+near+me/@${pos.coords.latitude},${pos.coords.longitude},15z`, '_blank');
      }, () => window.open('https://www.google.com/maps/search/medical+clinics+near+me/', '_blank'));
    } else window.open('https://www.google.com/maps/search/medical+clinics+near+me/', '_blank');
  };

  const refreshData = () => {
    // Generate fresh heart rate analysis (Heart Intelligence)
    generateHeartAnalysis();
    // Also trigger chronic vitals analysis
    generateChronicAnalysis();
  };

  return (
    <div className={`min-h-screen bg-minimal-bg text-minimal-ink font-sans ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'} transition-colors duration-500 selection:bg-minimal-blue/20`}>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#7EA0EA15,transparent_50%)] pointer-events-none" />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => signOut(auth)}
        userRole={profile?.role}
      />

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-minimal-border flex lg:hidden items-center justify-around py-3 px-4 z-50">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} />
        {profile?.role === 'caregiver' && <MobileNavButton active={activeTab === 'caregiver'} onClick={() => setActiveTab('caregiver')} icon={<HeartHandshake size={20} />} />}
        <MobileNavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<Users size={20} />} />
        <MobileNavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} />
        <MobileNavButton active={activeTab === 'aiHistory'} onClick={() => setActiveTab('aiHistory')} icon={<Brain size={20} />} />
        <MobileNavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} />
      </nav>

      <main className="lg:ml-24 min-h-screen transition-all duration-500 relative z-10 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <DashboardHeader 
            user={user}
            profile={profile}
            isSyncing={isSyncing}
            isAnalyzing={isAnalyzing}
            isInactive={todayStats.isInactive}
            lastAnalysisTime={lastAnalysisTime}
            notifications={notifications}
            onToggleNotifications={() => setIsNotificationOpen(true)}
            onRunAI={generateChronicAnalysis}
            onRefresh={refreshData}
            onSimulateLog={simulateHeartRate}
            onSOS={triggerSOS}
          />

          <NotificationPanel 
            isOpen={isNotificationOpen} 
            notifications={notifications}
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
                  latestRisk={aiInsights[0]?.risk || 'Normal'}
                  summary={aiInsights[0]?.summary || 'Heart Intelligence: Your vital signs are generally within healthy ranges.'}
                  advice={aiInsights[0]?.advice || 'Precision Advice: Maintain optimal hydration.'}
                  isAnalyzing={isAnalyzing}
                  onRefresh={generateHeartAnalysis}
                  onFindClinic={findNearestClinic}
                />
                <ChronicAIAnalysis 
                  analysis={chronicAnalysis || chronicles[0]}
                  isAnalyzing={isChronicAnalyzing}
                  onAnalyze={generateChronicAnalysis}
                />
                <HealthCharts 
                  chartView={chartView} 
                  setChartView={setChartView} 
                  data={chartView === 'daily' ? dailyBreakdown : (chartView === 'weekly' ? periodicTrends.weekly : periodicTrends.monthly)} 
                  activeMetric={activeMetric}
                  setActiveMetric={setActiveMetric}
                />
                <GraphAIIntelligence 
                  user={user}
                  view={chartView}
                  data={activeMetric === 'bmi' ? bmiLogs : (chartView === 'daily' ? dailyBreakdown : (chartView === 'weekly' ? periodicTrends.weekly : periodicTrends.monthly))}
                  metric={activeMetric === 'heartRate' ? 'Heart Rate' : activeMetric === 'bloodPressure' ? 'Blood Pressure' : activeMetric === 'bloodGlucose' ? 'Blood Glucose' : 'BMI'}
                  bmiData={bmiLogs}
                />
              </motion.div>
            )}

            {activeTab === 'caregiver' && (
              <CaregiverView 
                familyLinks={familyLinks} 
                onAddMember={() => setActiveTab('profile')} 
                alerts={vulnerabilityAlerts}
              />
            )}

            {activeTab === 'aiHistory' && (
              <AIHistoryTab 
                history={graphAIHistory} 
                onDelete={deleteGraphAIHistory}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab 
                history={unifiedHistory} 
                onDelete={controller.deleteUnifiedHistory}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab 
                profile={profile} 
                userId={user.uid}
                familyLinks={familyLinks}
                isAddingMember={isAddingMember}
                setIsAddingMember={setIsAddingMember}
                newMemberEmail={newMemberEmail}
                setNewMemberEmail={setNewMemberEmail}
                onAddMember={addFamilyMember}
                onRemoveMember={(id) => deleteDoc(doc(db, 'users', user.uid, 'family_links', id))}
                familyLinkStatus={familyLinkStatus}
                setFamilyLinkStatus={setFamilyLinkStatus}
                onUpdateProfile={updateProfile}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                fontSize={fontSize} 
                setFontSize={setFontSize} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <ManualVitalsModal 
        isOpen={isManualEntryOpen} 
        onClose={() => setIsManualEntryOpen(false)}
        vitals={manualVitals}
        setVitals={setManualVitals}
        onSave={saveManualVitals}
      />

      <NoDataModal 
        isOpen={showNoDataPopup} 
        onClose={() => {
          setShowNoDataPopup(false);
          controller.setAnalysisMessage(null);
        }} 
        onManualEntry={() => {
          setShowNoDataPopup(false);
          controller.setAnalysisMessage(null);
          setIsManualEntryOpen(true);
        }}
        title={controller.analysisMessage ? "Outdated Health Data" : undefined}
        message={controller.analysisMessage || undefined}
      />

      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsManualEntryOpen(true)}
          className="group flex items-center gap-3 px-6 py-4 bg-minimal-ink text-white rounded-[24px] shadow-2xl hover:shadow-minimal-ink/40 transition-all border border-white/10"
        >
          <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Log Vitals</span>
        </motion.button>
      </div>
    </div>
  );
};
