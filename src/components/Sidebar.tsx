import React from 'react';
import { LayoutDashboard, Users, History, HeartHandshake, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'history' | 'profile' | 'caregiver' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'history' | 'profile' | 'caregiver' | 'settings') => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, theme, setTheme }) => {
  return (
    <aside className={`w-64 border-r border-minimal-border flex flex-col p-8 hidden md:flex transition-colors ${theme === 'dark' ? 'bg-[#0A0A0A] border-white/5' : 'bg-minimal-white'}`}>
      <div className="mb-12 flex items-center gap-2">
        <span className="text-2xl font-bold bg-gradient-to-r from-minimal-blue to-blue-600 bg-clip-text text-transparent">
          VitaLife Assistant
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavButton 
          active={activeTab === 'dashboard'} 
          theme={theme}
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={18} />}
          label="Overview"
        />
        <NavButton 
          active={activeTab === 'caregiver'} 
          theme={theme}
          onClick={() => setActiveTab('caregiver')} 
          icon={<HeartHandshake size={18} />}
          label="Caregiver"
        />
        <NavButton 
          active={activeTab === 'profile'} 
          theme={theme}
          onClick={() => setActiveTab('profile')} 
          icon={<Users size={18} />}
          label="Biometrics"
        />
        <NavButton 
          active={activeTab === 'history'} 
          theme={theme}
          onClick={() => setActiveTab('history')} 
          icon={<History size={18} />}
          label="Risk History"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          theme={theme}
          onClick={() => setActiveTab('settings')} 
          icon={<SettingsIcon size={18} />}
          label="Settings"
        />
      </nav>

      <div className="space-y-4 pt-6 border-t border-minimal-border">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className={`flex items-center gap-3 transition-colors ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-minimal-muted hover:text-minimal-ink'}`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button 
          onClick={onLogout}
          className={`flex items-center gap-3 transition-colors ${theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-minimal-muted hover:text-minimal-ink'}`}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

interface NavButtonProps {
  active: boolean;
  theme: 'light' | 'dark';
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, theme, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? (theme === 'dark' ? 'bg-minimal-blue/20 text-minimal-blue' : 'bg-minimal-blue/5 text-minimal-blue')
        : (theme === 'dark' ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-minimal-muted hover:bg-minimal-bg hover:text-minimal-ink')
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
