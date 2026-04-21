import React from 'react';
import { StatCard } from './StatCard';
import { UserProfile } from '../../types';
import { getBPStatus, getGlucoseStatus, getHRStatus } from '../../lib/healthUtils';
import { Heart, Activity, Droplets, Zap, Thermometer, Wind, Scale } from 'lucide-react';

interface StatGridProps {
  todayStats: {
    heartRate: number | null;
    systolic?: number;
    diastolic?: number;
    glucose?: number;
    spo2?: number;
    temperature?: number;
    steps: number;
    hasDataToday: boolean;
  };
  profile: UserProfile | null;
}

export const StatGrid: React.FC<StatGridProps> = ({ todayStats, profile }) => {
  const bmi = profile?.bmi || (profile?.height && profile?.weight 
    ? Number((Number(profile.weight) / ((Number(profile.height)/100)**2)).toFixed(1)) 
    : null);

  const getBMIStatus = (val: number | null) => {
    if (val === null) return undefined;
    if (val < 18.5) return { level: 'Underweight', color: 'text-minimal-orange', label: 'Underweight' };
    if (val < 25) return { level: 'Normal', color: 'text-emerald-500', label: 'Healthy' };
    return { level: 'Overweight', color: 'text-minimal-orange', label: 'Overweight' };
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Heart Rate" 
          value={todayStats.hasDataToday ? todayStats.heartRate?.toString() || '--' : '--'} 
          unit="BPM"
          icon={<Heart size={18} />}
          showECG={true}
          status={getHRStatus(todayStats.heartRate)}
        />
        <StatCard 
          label="Blood Oxygen" 
          value={todayStats.hasDataToday && todayStats.spo2 ? todayStats.spo2.toString() : '--'} 
          unit="%"
          icon={<Wind size={18} />}
          status={todayStats.spo2 && todayStats.spo2 < 95 ? { level: 'Low', color: 'text-minimal-orange', label: 'Monitor' } : { level: 'Normal', color: 'text-emerald-500' }}
        />
        <StatCard 
          label="BMI Index" 
          value={bmi?.toString() || '--'} 
          unit="kg/m²"
          icon={<Scale size={18} />}
          status={getBMIStatus(bmi)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Blood Pressure" 
          value={todayStats.hasDataToday && (todayStats.systolic || todayStats.diastolic) 
            ? `${todayStats.systolic ?? '--'}/${todayStats.diastolic ?? '--'}` 
            : '--'} 
          unit="mmHg"
          icon={<Activity size={18} />}
          status={getBPStatus(todayStats.systolic, todayStats.diastolic)}
        />
        <StatCard 
          label="Blood Glucose" 
          value={todayStats.hasDataToday && todayStats.glucose ? todayStats.glucose.toString() : '--'} 
          unit="mg/dL"
          icon={<Droplets size={18} />}
          status={getGlucoseStatus(todayStats.glucose)}
        />
        <StatCard 
          label="Daily Activity" 
          value={todayStats.hasDataToday ? (todayStats.steps ?? 0).toLocaleString() : '0'} 
          unit="steps"
          icon={<Zap size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          label="Weight" 
          value={profile?.weight || '--'} 
          unit="kg"
        />
        <StatCard 
          label="Height" 
          value={profile?.height || '--'} 
          unit="cm"
        />
        <StatCard 
          label="Age" 
          value={profile?.age ? `${profile.age} years old` : '--'} 
          unit=""
        />
      </div>
    </div>
  );
};
