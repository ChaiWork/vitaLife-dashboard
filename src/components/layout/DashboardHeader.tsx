import React from 'react';
import { Bell, Activity, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { AuthUser, Notification, UserProfile } from '../../types';

interface DashboardHeaderProps {
  user: AuthUser;
  profile: UserProfile | null;
  isSyncing: boolean;
  isAnalyzing: boolean;
  isInactive?: boolean;
  isFamilyInactive?: boolean;
  inactiveFamilyName?: string;
  lastAnalysisTime: Date | null;
  notifications: Notification[];
  onToggleNotifications: () => void;
  onRunAI: () => void;
  onRefresh: () => void;
  onSimulateLog: () => void;
  onSOS: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  profile,
  isSyncing,
  isAnalyzing,
  isInactive,
  isFamilyInactive,
  inactiveFamilyName,
  lastAnalysisTime,
  notifications,
  onToggleNotifications,
  onRunAI,
  onRefresh,
  onSimulateLog,
  onSOS
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const role = profile?.role || 'patient';
  const showInactive = (role === 'patient' && isInactive) || (role === 'caregiver' && isFamilyInactive);
  const inactiveMessage = role === 'caregiver' ? `Family Inactive: ${inactiveFamilyName || 'Member'}` : 'No Movement: 2 Hours';

  const [timeAgo, setTimeAgo] = React.useState<string>('');

  React.useEffect(() => {
    if (!lastAnalysisTime) return;
    const update = () => {
      const diff = Math.floor((new Date().getTime() - lastAnalysisTime.getTime()) / 1000);
      if (diff < 60) setTimeAgo(`${diff}s ago`);
      else setTimeAgo(`${Math.floor(diff / 60)}m ago`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [lastAnalysisTime]);

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-vital-400/10 text-vital-400 rounded-xl">
             <Activity size={24} />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-minimal-ink">VitaLifeAssistant</h1>
        </div>
        <p className="text-xs font-bold text-minimal-muted/60 uppercase tracking-[0.2em] mb-3">AI-Powered Health Analytics & Companion</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 text-minimal-muted text-sm font-medium">
            <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-minimal-blue animate-pulse' : 'bg-vital-400 shadow-[0_0_8px_rgba(126,160,234,0.4)]'}`} />
            {isSyncing ? 'Syncing Analytics...' : 'Secure Intelligent Sync Active'}
            {showInactive && (
              <span className="flex items-center gap-1.5 ml-4 text-rose-500 font-bold text-xs ai-pulse-danger px-3 py-1 bg-rose-500/10 rounded-full">
                <AlertTriangle size={14} />
                {inactiveMessage}
              </span>
            )}
          </div>
          {lastAnalysisTime && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-vital-400 animate-in fade-in slide-in-from-top-1">
              <Activity size={10} />
              AI Sentinel: Active Analysis (Last: {timeAgo})
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Emergency SOS Button */}
        <button 
          onClick={() => {
            console.log('EMERGENCY SOS button clicked manually');
            onSOS();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          EMERGENCY SOS
        </button>

        <div className="h-8 w-[1px] bg-minimal-border mx-2 hidden lg:block" />

        <button 
          onClick={onRunAI}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2.5 glass-panel !bg-vital-400/5 !border-vital-400/20 rounded-2xl text-xs font-bold text-vital-400 hover:!bg-vital-400/10 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-3 h-3 border-2 border-vital-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Activity size={14} />
          )}
          Deep Insight
        </button>
        
        <button 
          onClick={onRefresh}
          className="p-2.5 glass-panel !bg-transparent !border-minimal-border rounded-xl text-minimal-muted hover:!bg-minimal-bg transition-all neumorph-btn"
          title="Refresh Heart Intelligence"
        >
          <RefreshCw size={18} />
        </button>
        <button 
          onClick={onSimulateLog}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-minimal-border rounded-xl text-xs font-medium text-minimal-muted hover:bg-minimal-bg transition-all mr-2"
        >
          <Plus size={14} /> Simulate Log
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-minimal-ink">{user.displayName}</p>
          <p className="text-xs text-minimal-muted">{role === 'caregiver' ? 'Caregiver Account' : 'Standard Account'}</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={onToggleNotifications}
            className="p-2 border border-minimal-border rounded-xl text-minimal-muted hover:bg-minimal-bg transition-all relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <img 
          src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border border-minimal-border"
        />
      </div>
    </header>
  );
};
