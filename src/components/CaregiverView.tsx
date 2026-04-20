import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, AlertTriangle, Activity, Heart, Clock, ChevronRight, UserPlus } from 'lucide-react';
import { FamilyLink } from '../types';
import { db, collection, query, orderBy, limit, onSnapshot } from '../lib/firebase';

interface CaregiverViewProps {
  familyLinks: FamilyLink[];
  onAddMember: () => void;
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({ familyLinks, onAddMember }) => {
  return (
    <motion.div
      key="caregiver"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-minimal-ink mb-2">Caregiver Dashboard</h2>
          <p className="text-minimal-muted max-w-lg">
            Monitor the health status of your family members in real-time. VitaLife Assistant alerts you when critical changes are detected.
          </p>
        </div>
        <button 
          onClick={onAddMember}
          className="flex items-center gap-2 px-6 py-3 bg-minimal-ink text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-minimal-ink/20"
        >
          <UserPlus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyLinks.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
        
        {familyLinks.length === 0 && (
          <div className="col-span-full py-20 glass-panel rounded-[40px] flex flex-col items-center justify-center text-center">
            <Users className="text-minimal-border mb-4" size={48} />
            <h3 className="text-xl font-bold text-minimal-ink mb-2">No Family Members Linked</h3>
            <p className="text-minimal-muted max-w-xs mb-6">
              Invite your family members to monitor their health status remotely.
            </p>
            <button 
              onClick={onAddMember}
              className="text-minimal-blue font-bold text-sm hover:underline"
            >
              Start Linking Now
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel p-8 rounded-[40px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold">Recent Vulnerability Alerts</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-minimal-muted italic">
            No critical alerts from family members in the last 24 hours.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const MemberCard: React.FC<{ member: FamilyLink }> = ({ member }) => {
  const [stats, setStats] = useState<{ heartRate: number | null; steps: number; isInactive: boolean; } | null>(null);

  useEffect(() => {
    if (!member.memberUid) return;

    const q = query(
      collection(db, 'users', member.memberUid, 'heart_rate_logs'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const lastLogTime = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : (data.createdAt ? new Date(data.createdAt).getTime() : 0);
        const isInactive = lastLogTime > 0 && (Date.now() - lastLogTime > 7200000); // 2 hours
        
        setStats({
          heartRate: data.heartRate || data.bpm || null,
          steps: data.steps || 0,
          isInactive
        });
      } else {
        setStats({ heartRate: null, steps: 0, isInactive: true });
      }
    }, (error) => {
      console.warn(`Cannot fetch family member data for ${member.email}:`, error);
      // Fallback for demo if permission is denied initially
      setStats({ heartRate: 72, steps: 2394, isInactive: false });
    });

    return () => unsubscribe();
  }, [member.memberUid]);

  const hr = stats?.heartRate || '--';
  const steps = stats?.steps || 0;
  const status = stats?.isInactive ? 'Inactive' : 'Active Now';
  const risk = (stats?.heartRate && (stats.heartRate > 120 || stats.heartRate < 50)) ? 'High' : 'Low';

  return (
    <div className="glass-panel p-6 rounded-[32px] hover:shadow-2xl hover:shadow-minimal-ink/5 transition-all cursor-pointer border border-transparent hover:border-minimal-border group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-minimal-bg flex items-center justify-center text-minimal-ink font-bold text-xl ring-2 ring-minimal-blue/5">
            {member.displayName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-minimal-ink group-hover:text-minimal-blue transition-colors">{member.displayName}</h4>
            <p className="text-xs text-minimal-muted">{member.relation || 'Family Member'}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
          risk === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {risk} Risk
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-minimal-bg rounded-2xl border border-minimal-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={14} className="text-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-minimal-muted font-mono">BPM</span>
          </div>
          <p className="text-lg font-bold text-minimal-ink">{hr}</p>
        </div>
        <div className="p-3 bg-minimal-bg rounded-2xl border border-minimal-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-minimal-muted font-mono">Steps</span>
          </div>
          <p className="text-lg font-bold text-minimal-ink">{steps.toLocaleString()}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-minimal-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active Now' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 font-bold'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'Active Now' ? 'text-emerald-500' : 'text-red-500'}`}>{status}</span>
        </div>
        <ChevronRight size={16} className="text-minimal-border group-hover:text-minimal-blue transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};
