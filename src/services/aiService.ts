import { getFunctions, httpsCallable } from "firebase/functions";

export const callChronicAI = async (data: {
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  heartRate?: number;
}) => {
  const functions = getFunctions(); // ✅ FIX HERE

  const fn = httpsCallable(functions, "chronicAnalysis");

  const res = await fn({
    systolic: data.systolic,
    diastolic: data.diastolic,
    glucose: data.glucose,
    heartRate: data.heartRate,
  });

  return res.data;
};