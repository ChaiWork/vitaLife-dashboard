import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAIAnalysis(vitals: {
  heartRate: number | null;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  spo2?: number | null;
}, profile: UserProfile | null) {
  const vitalsText = `
    Current Heart Rate: ${vitals.heartRate || 'N/A'} BPM
    Blood Pressure: ${vitals.systolic || 'N/A'}/${vitals.diastolic || 'N/A'} mmHg
    Blood Glucose: ${vitals.glucose || 'N/A'} mg/dL
    SpO2: ${vitals.spo2 || 'N/A'}%
    Patient Age: ${profile?.age || 'N/A'} years old
    Weight: ${profile?.weight || 'N/A'} kg
    Height: ${profile?.height || 'N/A'} cm
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these vital signs for a patient and provide a health assessment. If any values are critical (e.g. BP > 180/120, HR > 130 or < 40, Glucose > 250 or < 50), mark risk as 'Critical'. Otherwise if abnormal mark as 'Moderate' or 'High'. If normal, mark as 'Low'.
    
    Vitals: ${vitalsText}
    
    Return exactly in JSON format:
    {
      "risk": "Low" | "Moderate" | "High" | "Critical",
      "summary": "one or two sentences summarizing the current health state",
      "advice": "one specific actionable piece of health advice"
    }`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text.trim());
}
