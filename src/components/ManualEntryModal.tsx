/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: { hr: string, systolic: string, diastolic: string, glucose: string, steps: string, spo2: string };
  setVitals: (v: any) => void;
  onSave: () => void;
}

export function ManualEntryModal({ isOpen, onClose, vitals, setVitals, onSave }: ManualEntryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-minimal-ink/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel p-8 rounded-[40px] max-w-lg w-full shadow-3xl overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight text-minimal-ink">Record Vitals</h3>
          <button onClick={onClose} className="text-minimal-muted hover:text-minimal-ink">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <InputGroup label="Heart Rate (BPM)" value={vitals.hr} onChange={(v) => setVitals({...vitals, hr: v})} placeholder="e.g. 72" />
          <InputGroup label="Blood Glucose (mg/dL)" value={vitals.glucose} onChange={(v) => setVitals({...vitals, glucose: v})} placeholder="e.g. 95" />
          <InputGroup label="BP Systolic" value={vitals.systolic} onChange={(v) => setVitals({...vitals, systolic: v})} placeholder="Upper (120)" />
          <InputGroup label="BP Diastolic" value={vitals.diastolic} onChange={(v) => setVitals({...vitals, diastolic: v})} placeholder="Lower (80)" />
          <InputGroup label="SpO2 (%)" value={vitals.spo2} onChange={(v) => setVitals({...vitals, spo2: v})} placeholder="e.g. 98" />
          <InputGroup label="Steps Today" value={vitals.steps} onChange={(v) => setVitals({...vitals, steps: v})} placeholder="e.g. 5000" />
        </div>

        <button 
          onClick={onSave}
          disabled={!vitals.hr}
          className="w-full py-4 bg-minimal-ink text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-minimal-ink/20"
        >
          Save Vitals to Vault
        </button>
      </motion.div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted ml-1">{label}</label>
      <input 
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-minimal-bg border border-minimal-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-minimal-blue/20 transition-all font-medium"
      />
    </div>
  );
}
