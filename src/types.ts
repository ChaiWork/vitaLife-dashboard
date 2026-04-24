import { User } from 'firebase/auth';

export interface HeartRateLog {
  id: string;
  heartRate: number;
  steps?: number;
  createdAt: any; // Firebase Timestamp or ISO string
}

export interface ChronicVitalLog {
  id: string;
  systolic: number;
  diastolic: number;
  glucose: number;
  spo2: number;
  temperature?: number;
  createdAt: any;
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
  bmi?: number;
  role?: string;
  lastLogin?: any;
}

export interface RiskEntry {
  id: string;
  uid: string;
  date: string;
  time?: any; // Added for client-side sorting
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' | 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
  advice: string;
}

export interface AIInsight {
  id: string;
  heartRate: number;
  risk: string;
  summary: string;
  advice: string;
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

export interface BMILog {
  id: string;
  bmi: number;
  weight: number;
  height: number;
  createdAt: any;
}

export interface GraphAIHistory {
  id: string;
  metric: string;
  view: string;
  summary: string;
  stability: number;
  prediction: string;
  advice: string;
  trends: { label: string; change: number; trend: string }[];
  createdAt: any;
}

export interface VulnerabilityAlert {
  id: string;
  patientId: string;
  patientFullName: string;
  caregiverId: string;
  alertType: string;
  status: "critical" | "warning";
  createdAt: any;
  timestamp?: any; // Keeping for compatibility temporarily
}

export type AuthUser = User;
