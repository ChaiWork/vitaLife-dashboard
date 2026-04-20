/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeartRateLog {
  id: string;
  heartRate: number;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  steps?: number;
  spo2?: number | null;
  createdAt: any; // Firebase Timestamp or ISO string
}

export interface HeartRateBreakdown {
  id: string;
  heartRate: number;
  hour: number;
  date: any;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  role?: string;
  lastLogin?: any;
}

export interface RiskEntry {
  id: string;
  uid: string;
  date: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
  advice: string;
}

export interface AIInsight {
  id: string;
  heartRate: number;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  risk: string;
  summary: string;
  advice: string;
  explanation?: string;
  // Separate sections for split cards
  hrAnalysis?: {
    risk: string;
    summary: string;
    advice: string;
    explanation?: string;
  };
  bpGlucoseAnalysis?: {
    risk: string;
    summary: string;
    advice: string;
    explanation?: string;
  };
  date: any;
  createdAt: any;
}

export interface FamilyLink {
  id: string;
  memberUid: string;
  displayName: string;
  email: string;
  relation: string;
  status: 'pending' | 'active';
  createdAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency';
  read: boolean;
  createdAt: any;
}

export type ChartView = 'daily' | 'weekly' | 'monthly';
export type Tab = 'dashboard' | 'history' | 'profile';
