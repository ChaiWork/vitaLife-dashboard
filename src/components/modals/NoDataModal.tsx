import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface NoDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualEntry?: () => void;
  title?: string;
  message?: string;
}

export const NoDataModal: React.FC<NoDataModalProps> = ({ isOpen, onClose, onManualEntry, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-minimal-ink/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel p-10 rounded-[40px] max-w-md w-full text-center shadow-3xl"
          >
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-100">
              <AlertTriangle className="text-amber-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-minimal-ink">
              {title || "No Health Data Detected"}
            </h3>
            <div className="text-minimal-muted mb-8 text-sm leading-relaxed">
              {message ? (
                <p>{message}</p>
              ) : (
                <>
                  We couldn't find any recent vitals in your cloud vault. To start tracking:
                  <br/><br/>
                  1. Wear your **Smart Watch** or device.<br/>
                  2. Ensure **Google Fit** sync is enabled.<br/>
                  3. Check your mobile app connection.
                </>
              )}
            </div>
            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-minimal-ink text-white rounded-2xl font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Got it, I'll Check
              </button>
              <button 
                 onClick={() => window.open('https://fit.google.com', '_blank')}
                 className="w-full py-4 bg-minimal-white border border-minimal-border text-minimal-muted rounded-2xl font-semibold text-sm hover:bg-minimal-bg transition-all flex items-center justify-center gap-2"
              >
                Connect Google Fit
              </button>
              {onManualEntry && (
                <button 
                  onClick={onManualEntry}
                  className="w-full py-4 bg-white border-2 border-minimal-ink text-minimal-ink rounded-2xl font-bold text-sm hover:bg-minimal-bg transition-all active:scale-[0.98]"
                >
                  Enter Vitals Manually
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
