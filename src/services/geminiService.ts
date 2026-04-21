import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { UserProfile } from "../types";

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
}

export interface GraphAnalysisRequest {
  view: 'daily' | 'weekly' | 'monthly';
  data: any[];
  metric: string;
}

export interface GraphAnalysisResponse {
  summary: string;
  stability: number;
  trends: {
    label: string;
    change: number; // percentage
    trend: 'up' | 'down' | 'stable';
  }[];
}

/**
 * Calls the 'graphAnalysis' Firebase Callable Function to perform AI-driven longitudinal analysis.
 */
export async function generateGraphAnalysis(request: GraphAnalysisRequest): Promise<GraphAnalysisResponse> {
  const fn = httpsCallable(functions, "graphAnalysis");
  const result = await fn(request);
  return result.data as GraphAnalysisResponse;
}

/**
 * Calls the 'chronicAnalysis' Firebase Callable Function to perform AI-driven health assessment.
 * This migration ensures secure backend processing instead of direct client-side LLM calls.
 */
export async function generateAIAnalysis(vitals: AIAnalysisRequest, profile: UserProfile | null): Promise<AIAnalysisResponse> {
  const fn = httpsCallable(functions, "chronicAnalysis");
  
  // Ensure we don't send nulls for numeric fields that the backend expects as numbers
  const payload = {
    systolic: vitals.systolic || 120,
    diastolic: vitals.diastolic || 80,
    glucose: vitals.glucose || 95,
    heartRate: vitals.heartRate || 72,
    spo2: vitals.spo2 ?? 98, // Defaults to 98 if null or undefined
    age: profile?.age ? Number(profile.age) : 25, // Providing defaults if missing
    weight: profile?.weight ? Number(profile.weight) : 70,
    height: profile?.height ? Number(profile.height) : 170
  };
  
  const result = await fn(payload);
  
  return result.data as AIAnalysisResponse;
}
