import React from 'react';
import { Bell, Activity, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { AuthUser, Notification } from '../types';

interface DashboardHeaderProps {
  user: AuthUser;
  isSyncing: boolean;
  isAnalyzing: boolean;
  isInactive?: boolean;
  lastAnalysisTime: Date | null;
  notifications: Notification[];
  onToggleNotifications: () => void;
  onRunAI: () => void;
  onRefresh: () => void;
  onManualLog: () => void;
  onSimulateLog: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isSyncing,
  isAnalyzing,
  isInactive,
  lastAnalysisTime,
  notifications,
  onToggleNotifications,
  onRunAI,
  onRefresh,
  onManualLog,
  onSimulateLog
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

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
        <h1 className="text-4xl font-display font-bold tracking-tight text-minimal-ink mb-2">Health Dashboard</h1>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 text-minimal-muted text-sm font-medium">
            <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-minimal-blue animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
            {isSyncing ? 'Syncing Analytics...' : 'Secure Intelligent Sync Active'}
            {isInactive && (
              <span className="flex items-center gap-1.5 ml-4 text-rose-500 font-bold text-xs ai-pulse-danger px-3 py-1 bg-rose-500/10 rounded-full">
                <AlertTriangle size={14} />
                No Movement: 2 Hours
              </span>
            )}
          </div>
          {lastAnalysisTime && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-minimal-blue/80 animate-in fade-in slide-in-from-top-1">
              <Activity size={10} />
              AI Sentinel: Active Analysis (Last: {timeAgo})
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Emergency SOS Button */}
        <button 
          onClick={() => window.confirm('Trigger SOS Alert? This will notify your caregiver and local emergency services.')}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          EMERGENCY SOS
        </button>

        <div className="h-8 w-[1px] bg-minimal-border mx-2 hidden lg:block" />

        <button 
          onClick={onRunAI}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2.5 glass-panel !bg-minimal-blue/5 !border-minimal-blue/20 rounded-2xl text-xs font-bold text-minimal-blue hover:!bg-minimal-blue/10 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-3 h-3 border-2 border-minimal-blue border-t-transparent rounded-full animate-spin" />
          ) : (
            <Activity size={14} />
          )}
          Deep Insight
        </button>
        
        <button 
          onClick={onRefresh}
          className="p-2.5 glass-panel !bg-transparent !border-minimal-border rounded-xl text-minimal-muted hover:!bg-white transition-all neumorph-btn"
          title="Refresh Data"
        >
          <RefreshCw size={18} />
        </button>
        <button 
          onClick={onManualLog}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-minimal-border rounded-xl text-xs font-medium text-minimal-muted hover:bg-minimal-white transition-all mr-2"
        >
          <Plus size={14} /> Manual Log
        </button>
        <button 
          onClick={onSimulateLog}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-minimal-border rounded-xl text-xs font-medium text-minimal-muted hover:bg-minimal-white transition-all mr-2"
        >
          <Plus size={14} /> Simulate Log
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-minimal-ink">{user.displayName}</p>
          <p className="text-xs text-minimal-muted">Standard Account</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={onToggleNotifications}
            className="p-2 border border-minimal-border rounded-xl text-minimal-muted hover:bg-minimal-white transition-all relative"
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
