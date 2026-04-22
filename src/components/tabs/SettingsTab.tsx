import React from 'react';
import { motion } from 'motion/react';
import { Sun, Type, Eye, Shield, Bell } from 'lucide-react';

interface SettingsTabProps {
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ fontSize, setFontSize }) => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-minimal-ink mb-2">Settings & Accessibility</h2>
          <p className="text-minimal-muted max-w-lg">
            Customize your VitaLife Assistant experience to suit your needs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <section className="glass-panel p-8 rounded-[40px] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-minimal-blue/10 text-minimal-blue">
              <Sun size={20} />
            </div>
            <h3 className="text-lg font-bold">Appearance</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Type size={16} className="text-minimal-muted" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted">Text Size</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      fontSize === size 
                        ? 'bg-minimal-ink text-white border-minimal-ink' 
                        : 'bg-minimal-white text-minimal-muted border-minimal-border hover:border-minimal-muted shadow-sm'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="glass-panel p-8 rounded-[40px] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Eye size={20} />
              </div>
              <h3 className="text-lg font-bold">Accessibility</h3>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${fontSize === 'large' ? 'bg-emerald-500 text-white' : 'bg-minimal-bg text-minimal-muted'}`}>
              Elderly Mode: {fontSize === 'large' ? 'ON' : 'OFF'}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-minimal-bg rounded-2xl border border-minimal-border">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-minimal-muted" />
                <div>
                  <p className="text-sm font-bold">Elderly Friendly Mode</p>
                  <p className="text-[10px] text-minimal-muted uppercase font-bold tracking-tight">Large fonts & simple layout</p>
                </div>
              </div>
              <button 
                onClick={() => setFontSize(fontSize === 'large' ? 'medium' : 'large')}
                className={`w-12 h-6 rounded-full relative transition-colors ${fontSize === 'large' ? 'bg-emerald-500' : 'bg-minimal-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${fontSize === 'large' ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-minimal-bg rounded-2xl border border-minimal-border">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-minimal-muted" />
                <div>
                  <p className="text-sm font-bold">Audio Cues</p>
                  <p className="text-[10px] text-minimal-muted uppercase font-bold tracking-tight">Sound alerts for critical events</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-minimal-border rounded-full relative opacity-50 cursor-not-allowed">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};
