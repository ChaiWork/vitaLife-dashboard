import React from 'react';
import { Bell, Activity, Plus, RefreshCw } from 'lucide-react';
import { AuthUser, Notification } from '../types';

interface DashboardHeaderProps {
  user: AuthUser;
  isSyncing: boolean;
  isAnalyzing: boolean;
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
  notifications,
  onToggleNotifications,
  onRunAI,
  onRefresh,
  onManualLog,
  onSimulateLog
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex justify-between items-end mb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-minimal-ink">Health Dashboard</h1>
        <div className="flex items-center gap-2 text-minimal-muted mt-1 text-sm">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-minimal-blue animate-pulse' : 'bg-minimal-green'}`} />
          {isSyncing ? 'Syncing Cloud Vault...' : 'Direct Cloud Sync Active'}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onRunAI}
          disabled={isAnalyzing}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-minimal-blue/10 border border-minimal-blue/20 rounded-xl text-xs font-bold text-minimal-blue hover:bg-minimal-blue/20 transition-all mr-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-3 h-3 border-2 border-minimal-blue border-t-transparent rounded-full animate-spin" />
          ) : (
            <Activity size={14} />
          )}
          Run AI Insight
        </button>
        <button 
          onClick={onRefresh}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-minimal-border rounded-xl text-xs font-medium text-minimal-muted hover:bg-minimal-white transition-all mr-2"
        >
          <RefreshCw size={14} /> Refresh
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
