/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  LogOut 
} from 'lucide-react';
import { NavButton } from './NavButton';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-minimal-white border-r border-minimal-border flex flex-col p-8 hidden md:flex h-screen sticky top-0">
      <div className="mb-12">
        <span className="font-bold text-xl tracking-tight text-minimal-blue">VitaLife Assistant</span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={18} />}
          label="Overview"
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<Users size={18} />}
          label="Biometrics"
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History size={18} />}
          label="Risk History"
        />
      </nav>

      <button 
        onClick={onLogout}
        className="flex items-center gap-3 text-minimal-muted hover:text-minimal-ink transition-colors pt-6 border-t border-minimal-border group"
      >
        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
        <span className="font-medium text-sm">Sign Out</span>
      </button>
    </aside>
  );
}
