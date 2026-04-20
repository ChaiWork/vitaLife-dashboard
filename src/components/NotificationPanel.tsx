/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trash2, MapPin, X } from 'lucide-react';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  isClearingAll: boolean;
  setIsClearingAll: (val: boolean) => void;
  onClose: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
  onMarkRead: () => void;
  onFindClinic: () => void;
}

export function NotificationPanel({
  notifications,
  isClearingAll,
  setIsClearingAll,
  onClose,
  onClearAll,
  onDelete,
  onMarkRead,
  onFindClinic
}: NotificationPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 mt-3 w-[100vw] sm:w-[350px] bg-white rounded-3xl shadow-2xl border border-minimal-border z-50 overflow-hidden"
    >
      <div className="p-5 border-b border-minimal-border flex justify-between items-center bg-minimal-bg/30">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-minimal-ink">Alerts</h3>
          {notifications.length > 0 && (
            <>
              <button 
                onClick={onMarkRead}
                className="text-[10px] text-minimal-blue hover:underline font-bold transition-all"
              >
                Mark all as read
              </button>
              <span className="text-minimal-border">|</span>
              {isClearingAll ? (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-red-500 font-bold uppercase">Confirm?</span>
                  <button 
                    onClick={onClearAll}
                    className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-md font-bold"
                  >
                    Yes
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
                  notif.type === 'emergency' ? 'bg-red-500' : 
                  notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
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
  );
}
