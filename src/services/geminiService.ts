import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../lib/firebase";
import { UserProfile } from "../types";

/**
 * Helper to get the current Firebase ID token for authenticated requests
 */
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`
  };
}

export interface AIAnalysisRequest {
  heartRate: number | null;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  spo2?: number | null;
}

export interface AIAnalysisResponse {
  risk: "Low" | "Moderate" | "High" | "Critical";
  summary: string;
  advice: string;
  clinicalSummary?: string;
  futureRisks?: string;
  medications?: string;
  prevention?: string;
}

export interface GraphAnalysisRequest {
  view: 'daily' | 'weekly' | 'monthly';
  data: any[];
  metric: string;
  bmiData?: any[];
}

export interface GraphAnalysisResponse {
  summary: string;
  stability: number;
  trends: {
    label: string;
    change: number; // percentage
    trend: 'up' | 'down' | 'stable';
  }[];
  prediction: string;
  advice: string;
}

/**
 * Calls the 'graphAnalysis' Cloud Run endpoint to perform AI-driven longitudinal analysis.
 */
export async function generateGraphAnalysis(request: GraphAnalysisRequest): Promise<GraphAnalysisResponse> {
  const url = import.meta.env.VITE_GRAPH_ANALYSIS_URL || 'https://graphanalysis-pfndekuqha-as.a.run.app';
  
  const authHeaders = await getAuthHeaders();
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ data: request })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'No error body');
    throw new Error(`Graph analysis failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  // Firebase Callables return { result: ... } in modern versions or { data: ... } in older/custom ones
  return (data.result || data.data || data) as GraphAnalysisResponse;
}

/**
 * Calls the health/chronic analysis Cloud Run endpoint to perform AI-driven health assessment.
 */
export async function generateAIAnalysis(vitals: AIAnalysisRequest, profile: UserProfile | null): Promise<AIAnalysisResponse> {
  const url = import.meta.env.VITE_CHRONIC_ANALYSIS_URL || 'https://chronicanalysis-pfndekuqha-as.a.run.app';

  const payload = {
    systolic: vitals.systolic || 120,
    diastolic: vitals.diastolic || 80,
    glucose: vitals.glucose || 95,
    heartRate: vitals.heartRate || 72,
    spo2: vitals.spo2 ?? 98,
    age: (profile?.age && !isNaN(Number(profile.age)) && Number(profile.age) > 0) ? Number(profile.age) : 45,
    weight: (profile?.weight && !isNaN(Number(profile.weight)) && Number(profile.weight) > 0) ? Number(profile.weight) : 75,
    height: (profile?.height && !isNaN(Number(profile.height)) && Number(profile.height) > 0) ? Number(profile.height) : 175
  };

  const authHeaders = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ data: payload })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'No error body');
    throw new Error(`AI analysis failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return (data.result || data.data || data) as AIAnalysisResponse;
}

/**
 * Calls the simple health analysis Cloud Run endpoint.
 */
export async function generateHealthAnalysis(vitals: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const url = import.meta.env.VITE_HEALTH_ANALYSIS_URL || 'https://healthanalysis-pfndekuqha-as.a.run.app';

  const authHeaders = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ data: vitals })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'No error body');
    throw new Error(`Health analysis failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return (data.result || data.data || data) as AIAnalysisResponse;
}
