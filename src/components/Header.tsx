/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { User } from '../lib/firebase';
import { Notification } from '../types';

interface HeaderProps {
  user: User;
  activeTab: string;
  isSyncing: boolean;
  refreshData: () => void;
  notifications: Notification[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (val: boolean) => void;
}

export function Header({ 
  user, 
  activeTab, 
  isSyncing, 
  refreshData, 
  notifications, 
  isNotificationOpen, 
  setIsNotificationOpen 
}: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex justify-between items-center mb-12">
      <div className="flex items-center gap-3 md:hidden">
        <span className="font-bold text-xl tracking-tight text-minimal-blue">VL</span>
      </div>
      
      <div>
        <h1 className="text-3xl font-black text-minimal-ink tracking-tight capitalize">
          {activeTab === 'dashboard' ? 'Health Intelligence' : 
           activeTab === 'profile' ? 'Clinical Biometrics' : 'Risk Timeline'}
        </h1>
        <p className="text-minimal-muted text-xs font-bold uppercase tracking-widest mt-1">
          {activeTab === 'dashboard' ? 'Daily Vitals Tracking' : 
           activeTab === 'profile' ? 'Personal Health Baseline' : 'Long-term trend analysis'}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={refreshData}
          disabled={isSyncing}
          className={`p-2.5 bg-white border border-minimal-border rounded-xl text-minimal-muted hover:text-minimal-ink transition-all shadow-sm ${isSyncing ? 'animate-spin opacity-50' : ''}`}
        >
          <RefreshCw size={18} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2.5 bg-white border border-minimal-border rounded-xl text-minimal-muted hover:text-minimal-ink transition-all shadow-sm relative group"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <img 
          src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border border-minimal-border hidden sm:block"
        />
      </div>
    </header>
  );
}
