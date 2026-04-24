import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ManualVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: {
    systolic: string;
    diastolic: string;
    glucose: string;
    spo2: string;
    heartRate: string;
  };
  setVitals: (vitals: any) => void;
  onSave: () => void;
}

export const ManualVitalsModal: React.FC<ManualVitalsModalProps> = ({
  isOpen,
  onClose,
  vitals,
  setVitals,
  onSave
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-minimal-ink/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel p-8 rounded-[40px] max-w-lg w-full shadow-3xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-minimal-ink">Record Metabolic Vitals</h3>
              <button onClick={onClose} className="text-minimal-muted hover:text-minimal-ink">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted ml-1">Heart Rate (BPM)</label>
                <input 
                   type="number"
                   placeholder="e.g. 72"
                   value={vitals.heartRate}
                   onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                   className="w-full p-4 bg-minimal-bg border border-minimal-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-minimal-blue/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted ml-1">Blood Glucose (mg/dL)</label>
                <input 
                  type="number"
                  placeholder="e.g. 95"
                  value={vitals.glucose}
                  onChange={(e) => setVitals({...vitals, glucose: e.target.value})}
                  className="w-full p-4 bg-minimal-bg border border-minimal-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-minimal-blue/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted ml-1">SpO2 (%)</label>
                <input 
                  type="number"
                  placeholder="e.g. 98"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                  className="w-full p-4 bg-minimal-bg border border-minimal-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-minimal-blue/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted ml-1">BP Systolic (Upper)</label>
                <input 
                  type="number"
                  placeholder="Upper (120)"
                  value={vitals.systolic}
                  onChange={(e) => setVitals({...vitals, systolic: e.target.value})}
                  className="w-full p-4 bg-minimal-bg border border-minimal-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-minimal-blue/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted ml-1">BP Diastolic (Lower)</label>
                <input 
                  type="number"
                  placeholder="Lower (80)"
                  value={vitals.diastolic}
                  onChange={(e) => setVitals({...vitals, diastolic: e.target.value})}
                  className="w-full p-4 bg-minimal-bg border border-minimal-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-minimal-blue/20 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              onClick={onSave}
              disabled={!vitals.glucose && !vitals.systolic && !vitals.spo2 && !vitals.heartRate}
              className="w-full py-4 bg-minimal-ink text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-minimal-ink/20"
            >
              Save Vitals to Vault
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
