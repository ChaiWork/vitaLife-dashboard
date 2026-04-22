import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, History, HeartHandshake, LogOut, Activity, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'history' | 'profile' | 'caregiver' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'history' | 'profile' | 'caregiver' | 'settings') => void;
  onLogout: () => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, userRole }) => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-24 border-r border-minimal-border flex flex-col items-center py-10 hidden lg:flex transition-all z-40 bg-minimal-white">
      <div className="mb-12">
        <div className="w-12 h-12 bg-minimal-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-minimal-blue/30 group cursor-pointer hover:rotate-6 transition-transform">
          <Activity size={24} className="group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <nav className="flex-1 w-full px-4 space-y-4">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={20} />}
          label="Home"
        />
        {userRole === 'caregiver' && (
          <NavButton 
            active={activeTab === 'caregiver'} 
            onClick={() => setActiveTab('caregiver')} 
            icon={<HeartHandshake size={20} />}
            label="Family"
          />
        )}
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<Users size={20} />}
          label="Profile"
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History size={20} />}
          label="Records"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<SettingsIcon size={20} />}
          label="Setup"
        />
      </nav>

      <div className="space-y-6 pt-6 border-t border-minimal-border w-full flex flex-col items-center">
        <button 
          onClick={onLogout}
          className="p-3 rounded-xl transition-all text-minimal-muted hover:text-red-500 hover:bg-neutral-500/10"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-all group relative ${
      active 
        ? 'bg-minimal-blue/10 text-minimal-blue shadow-sm ring-1 ring-minimal-blue/10'
        : 'text-minimal-muted hover:bg-minimal-bg hover:text-minimal-ink'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="activeNav"
        className="absolute left-0 w-1 h-6 bg-minimal-blue rounded-r-full"
      />
    )}
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1 ${active ? 'opacity-60 !bottom-1.5' : ''}`}>
      {label}
    </span>
  </button>
);
