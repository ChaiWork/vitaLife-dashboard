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

/**
 * Calls the 'chronicAnalysis' Firebase Callable Function to perform AI-driven health assessment.
 * This migration ensures secure backend processing instead of direct client-side LLM calls.
 */
export async function generateAIAnalysis(vitals: AIAnalysisRequest, profile: UserProfile | null): Promise<AIAnalysisResponse> {
  const fn = httpsCallable(functions, "chronicAnalysis");
  
  const result = await fn({
    systolic: vitals.systolic,
    diastolic: vitals.diastolic,
    glucose: vitals.glucose,
    heartRate: vitals.heartRate,
    spo2: vitals.spo2,
    age: profile?.age ? Number(profile.age) : undefined,
    weight: profile?.weight ? Number(profile.weight) : undefined,
    height: profile?.height ? Number(profile.height) : undefined
  });
  
  return result.data as AIAnalysisResponse;
}
