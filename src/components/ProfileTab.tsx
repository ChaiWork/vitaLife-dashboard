/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { UserProfile, FamilyLink } from '../types';

interface ProfileTabProps {
  profile: UserProfile | null;
  familyLinks: FamilyLink[];
  isAddingMember: boolean;
  setIsAddingMember: (val: boolean) => void;
  newMemberEmail: string;
  setNewMemberEmail: (val: string) => void;
  familyLinkStatus: { type: 'success' | 'error', message: string } | null;
  setFamilyLinkStatus: (val: any) => void;
  deletingMemberId: string | null;
  setDeletingMemberId: (val: string | null) => void;
  onAddMember: (email: string) => void;
  onRemoveMember: (uid: string) => void;
  onUpdateProfile: (data: any) => void;
}

export function ProfileTab({
  profile,
  familyLinks,
  isAddingMember,
  setIsAddingMember,
  newMemberEmail,
  setNewMemberEmail,
  familyLinkStatus,
  setFamilyLinkStatus,
  deletingMemberId,
  setDeletingMemberId,
  onAddMember,
  onRemoveMember,
  onUpdateProfile
}: ProfileTabProps) {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Biometrics Card */}
      <div className="glass-panel p-8 rounded-[40px] shadow-sm border-minimal-border">
        <h2 className="text-xl font-bold mb-8 text-minimal-ink flex items-center gap-2">
          <ShieldCheck size={24} className="text-minimal-ink" />
          Clinical Biometrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField label="Full Name" value={profile?.fullName || profile?.displayName || '--'} />
          <ProfileField label="Email Address" value={profile?.email || '--'} />
          <ProfileField label="Age" value={profile?.age || '--'} suffix="years" />
          <ProfileField label="Gender" value={profile?.gender || '--'} />
          <ProfileField label="Height" value={profile?.height || '--'} suffix="cm" />
          <ProfileField label="Weight" value={profile?.weight || '--'} suffix="kg" />
        </div>
      </div>

      {/* Family Circle */}
      <div className="glass-panel p-8 rounded-[40px] shadow-sm border-minimal-border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-minimal-ink flex items-center gap-2">
              <Users size={24} />
              Caregiver Network
            </h2>
            <p className="text-[10px] text-minimal-muted uppercase tracking-wider font-bold mt-1">Shared Clinical Safety</p>
          </div>
          {!isAddingMember && (
            <button 
              onClick={() => setIsAddingMember(true)}
              className="px-3 py-1.5 bg-minimal-ink text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <Plus size={14} /> Add Member
            </button>
          )}
        </div>
        
        {isAddingMember && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-minimal-bg p-4 rounded-2xl border border-minimal-border space-y-3 mb-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-minimal-muted">Enter family member's email</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="family@example.com"
                className="flex-1 px-3 py-2 bg-white border border-minimal-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-minimal-blue/20"
              />
              <button 
                onClick={() => onAddMember(newMemberEmail)}
                className="px-4 py-2 bg-minimal-ink text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                Link
              </button>
              <button 
                onClick={() => {
                  setIsAddingMember(false);
                  setFamilyLinkStatus(null);
                }}
                className="px-4 py-2 bg-white border border-minimal-border text-minimal-muted rounded-xl text-xs font-bold hover:bg-minimal-bg transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {familyLinkStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl text-[11px] font-medium border mb-6 ${
              familyLinkStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            {familyLinkStatus.message}
          </motion.div>
        )}
        
        <p className="text-xs text-minimal-muted leading-relaxed mb-6">
          Add family members here. They will receive critical heart rate alerts and emergency notifications if your health metrics reach dangerous levels.
        </p>

        <div className="space-y-3">
          {familyLinks.length > 0 ? familyLinks.map(link => (
            <div key={link.id} className="flex items-center justify-between p-3 bg-minimal-bg rounded-xl border border-minimal-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-vital-100 flex items-center justify-center text-vital-500 font-bold text-xs">
                  {link.displayName ? link.displayName[0] : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-minimal-ink">{link.displayName || 'Unknown Member'}</p>
                  <p className="text-[10px] text-minimal-muted">{link.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-minimal-blue bg-white px-2 py-0.5 rounded border border-minimal-border shadow-sm">
                  {link.status}
                </span>
                {deletingMemberId === link.memberUid ? (
                  <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
                    <button 
                      onClick={() => onRemoveMember(link.memberUid)}
                      className="px-2 py-1 bg-red-500 text-white text-[9px] font-bold rounded-lg hover:bg-red-600 transition-all shadow-sm"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => setDeletingMemberId(null)}
                      className="px-2 py-1 bg-white border border-minimal-border text-minimal-muted text-[9px] font-bold rounded-lg hover:bg-minimal-bg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDeletingMemberId(link.memberUid)}
                    className="p-1.5 text-minimal-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove Member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-minimal-muted border-2 border-dashed border-minimal-border rounded-2xl">
              <Users size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs italic">No family members linked yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProfileField({ label, value, suffix }: { label: string, value: string, suffix?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase font-bold text-minimal-muted tracking-widest ml-1">{label}</p>
      <div className="bg-minimal-bg p-4 rounded-2xl border border-minimal-border">
        <p className="text-sm font-semibold text-minimal-ink">{value} {value !== '--' ? suffix : ''}</p>
      </div>
    </div>
  );
}
