import React from 'react';
import { motion } from 'motion/react';
import { Activity, Plus } from 'lucide-react';
import { UserProfile, FamilyLink } from '../types';

interface ProfileTabProps {
  profile: UserProfile | null;
  familyLinks: FamilyLink[];
  isAddingMember: boolean;
  setIsAddingMember: (val: boolean) => void;
  newMemberEmail: string;
  setNewMemberEmail: (email: string) => void;
  onAddMember: (email: string) => void;
  familyLinkStatus: { type: 'success' | 'error', message: string } | null;
  setFamilyLinkStatus: (status: any) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  familyLinks,
  isAddingMember,
  setIsAddingMember,
  newMemberEmail,
  setNewMemberEmail,
  onAddMember,
  familyLinkStatus,
  setFamilyLinkStatus
}) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-6">User Biometrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="flex justify-between border-b border-minimal-border pb-4">
            <span className="text-minimal-muted">Full Name</span>
            <span className="font-semibold">{profile?.fullName || '--'}</span>
          </div>
          <div className="flex justify-between border-b border-minimal-border pb-4">
            <span className="text-minimal-muted">Gender</span>
            <span className="font-semibold capitalize">{profile?.gender || '--'}</span>
          </div>
          <div className="flex justify-between border-b border-minimal-border pb-4">
            <span className="text-minimal-muted">Age</span>
            <span className="font-semibold">{profile?.age || '--'} years old</span>
          </div>
          <div className="flex justify-between">
            <span className="text-minimal-muted">Role</span>
            <span className="font-semibold uppercase text-xs tracking-widest">{profile?.role || 'user'}</span>
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="flex justify-between border-b border-minimal-border pb-4">
            <span className="text-minimal-muted">Height</span>
            <span className="font-semibold">{profile?.height || '--'} cm</span>
          </div>
          <div className="flex justify-between border-b border-minimal-border pb-4">
            <span className="text-minimal-muted">Weight</span>
            <span className="font-semibold">{profile?.weight || '--'} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-minimal-muted">BMI</span>
            <span className="font-semibold">
              {profile?.height && profile?.weight 
                ? (Number(profile.weight) / ((Number(profile.height)/100)**2)).toFixed(1) 
                : '--'}
            </span>
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-semibold text-lg">VitaLife Assistant</h3>
          <div className="p-4 bg-minimal-bg border border-minimal-border rounded-2xl flex items-start gap-3">
            <div className="p-2 bg-minimal-blue/10 rounded-lg text-minimal-blue">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-minimal-ink mb-1">App Integration Active</p>
              <p className="text-[11px] text-minimal-muted leading-relaxed">
                Your biometric data and emergency alerts are synced in real-time with the VitaLife Assistant mobile app. Push notifications will be delivered to your phone during critical health events.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Family Circle {familyLinks.length > 0 && `(${familyLinks.length})`}</h3>
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
              className="bg-minimal-bg p-4 rounded-2xl border border-minimal-border space-y-3"
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
              className={`p-3 rounded-xl text-[11px] font-medium border ${
                familyLinkStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}
            >
              {familyLinkStatus.message}
            </motion.div>
          )}
          
          <p className="text-xs text-minimal-muted leading-relaxed">
            Add family members here. They will receive critical heart rate alerts and emergency notifications if your health metrics reach dangerous levels.
          </p>

          <div className="space-y-3">
            {familyLinks.map(link => (
              <div key={link.id} className="flex justify-between items-center p-3 border border-minimal-border rounded-xl bg-white">
                <div>
                  <p className="text-xs font-bold text-minimal-ink">{link.displayName}</p>
                  <p className="text-[10px] text-minimal-muted">{link.email}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-minimal-blue/10 text-minimal-blue rounded">
                  {link.relation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
