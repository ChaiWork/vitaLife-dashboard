import React from 'react';
import { LayoutDashboard, Users, History, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="w-64 bg-minimal-white border-r border-minimal-border flex flex-col p-8 hidden md:flex">
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
        className="flex items-center gap-3 text-minimal-muted hover:text-minimal-ink transition-colors pt-6 border-t border-minimal-border"
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-minimal-blue/5 text-minimal-blue' 
        : 'text-minimal-muted hover:bg-minimal-bg'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
