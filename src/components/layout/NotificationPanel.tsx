import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, MapPin } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  isClearingAll: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  setIsClearingAll: (val: boolean) => void;
  onFindClinic: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  isClearingAll,
  onClose,
  onDelete,
  onClearAll,
  setIsClearingAll,
  onFindClinic
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-minimal-white dark:bg-minimal-bg border border-minimal-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-minimal-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">Notifications</h4>
                {notifications.length > 0 && (
                  <>
                    {isClearingAll ? (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                        <button 
                          onClick={onClearAll}
                          className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-md font-bold hover:bg-red-600 shadow-sm"
                        >
                          Sure?
                        </button>
                        <button 
                          onClick={() => setIsClearingAll(false)}
                          className="text-[9px] bg-minimal-bg text-minimal-muted px-2 py-0.5 rounded-md font-bold border border-minimal-border"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsClearingAll(true)}
                        className="text-[10px] text-minimal-muted hover:text-red-500 font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </>
                )}
              </div>
              <button onClick={onClose} className="text-minimal-muted hover:text-minimal-ink">
                <X size={14} />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-minimal-border last:border-0 hover:bg-minimal-bg transition-all ${!notif.read ? 'bg-minimal-bg/30' : ''}`}
                  >
                    <div className="flex gap-3 relative group">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        notif.type === 'emergency' ? 'bg-rose-500' : 
                        notif.type === 'warning' ? 'bg-amber-500' : 'bg-vital-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-minimal-ink mb-0.5">{notif.title}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notif.id);
                            }}
                            className="text-minimal-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-[11px] text-minimal-muted leading-relaxed mb-2 pr-4">{notif.message}</p>
                        {notif.type === 'emergency' && (
                          <button 
                            onClick={onFindClinic}
                            className="text-[10px] font-bold text-red-600 flex items-center gap-1 hover:underline"
                          >
                            <MapPin size={10} /> Find Nearest Clinic
                          </button>
                        )}
                        <p className="text-[9px] text-minimal-muted mt-2 opacity-50">
                          {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-minimal-muted text-xs italic">
                  No new notifications
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
