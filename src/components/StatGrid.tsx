import React from 'react';
import { StatCard } from './StatCard';
import { UserProfile } from '../types';
import { getBPStatus, getGlucoseStatus, getHRStatus } from '../lib/healthUtils';

interface StatGridProps {
  todayStats: {
    heartRate: number | null;
    systolic?: number;
    diastolic?: number;
    glucose?: number;
    steps: number;
    hasDataToday: boolean;
  };
  profile: UserProfile | null;
}

export const StatGrid: React.FC<StatGridProps> = ({ todayStats, profile }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Heart Rate" 
          value={todayStats.hasDataToday ? todayStats.heartRate?.toString() || '--' : '--'} 
          unit="BPM"
          status={getHRStatus(todayStats.heartRate)}
        />
        <StatCard 
          label="Blood Pressure" 
          value={todayStats.hasDataToday && todayStats.systolic ? `${todayStats.systolic}/${todayStats.diastolic}` : '--'} 
          unit="mmHg"
          status={getBPStatus(todayStats.systolic, todayStats.diastolic)}
        />
        <StatCard 
          label="Blood Glucose" 
          value={todayStats.hasDataToday && todayStats.glucose ? todayStats.glucose.toString() : '--'} 
          unit="mg/dL"
          status={getGlucoseStatus(todayStats.glucose)}
        />
        <StatCard 
          label="Steps Today" 
          value={todayStats.hasDataToday ? todayStats.steps.toLocaleString() : '0'} 
          unit="steps"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          value={profile?.age ? `${profile.age} yrs` : '--'} 
          unit=""
        />
      </div>
    </div>
  );
};
