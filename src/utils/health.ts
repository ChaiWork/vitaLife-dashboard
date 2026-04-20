/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const getBPStatus = (sys: number | undefined, dia: number | undefined) => {
  if (!sys || !dia) return { level: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-50', label: 'No Data' };
  if (sys < 120 && dia < 80) return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
  if (sys >= 180 || dia >= 120) return { level: 'Crisis', color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨', label: 'Crisis' };
  if (sys >= 140 || dia >= 90) return { level: 'Stage 2', color: 'text-red-500', bg: 'bg-red-50', emoji: '🔴', label: 'HTN Stage 2' };
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { level: 'Stage 1', color: 'text-amber-500', bg: 'bg-amber-50', emoji: '🟡', label: 'HTN Stage 1' };
  return { level: 'Elevated', color: 'text-amber-400', bg: 'bg-amber-50', emoji: '🟡', label: 'Elevated' };
};

export const getGlucoseStatus = (mgdl: number | undefined) => {
  if (!mgdl) return { level: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-50', label: 'No Data' };
  if (mgdl >= 70 && mgdl <= 99) return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
  if (mgdl > 200 || mgdl < 50) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨', label: 'Critical' };
  if (mgdl >= 126) return { level: 'Diabetes', color: 'text-red-500', bg: 'bg-red-50', emoji: '🔴', label: 'Diabetes' };
  return { level: 'Prediabetes', color: 'text-amber-500', bg: 'bg-amber-50', emoji: '🟡', label: 'Prediabetes' };
};

export const getHRStatus = (bpm: number | null) => {
  if (bpm === null) return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
  if (bpm < 40 || bpm > 130) return { level: 'Emergency', color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨', label: 'Emergency' };
  if (bpm < 50 || bpm > 110) return { level: 'Alert', color: 'text-red-500', bg: 'bg-red-50', emoji: '🔴', label: 'Alert' };
  if ((bpm >= 50 && bpm <= 59) || (bpm >= 100 && bpm <= 110)) return { level: 'Warning', color: 'text-amber-500', bg: 'bg-amber-50', emoji: '🟡', label: 'Warning' };
  return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
};

export const calculateLocalHeartRateAnalysis = (hr: number) => {
  const risk = hr < 50 || hr > 110 ? 'High' : (hr < 60 || hr > 100 ? 'Moderate' : 'Low');
  let summary = 'Heart rate is within the healthy resting range.';
  let advice = 'Continue maintaining your current physical activity levels.';
  
  if (risk === 'High') {
    summary = hr > 110 ? 'Heart rate is significantly elevated (Tachycardia).' : 'Heart rate is significantly low (Bradycardia).';
    advice = 'Please rest and re-measure. Consult a professional if this persists.';
  } else if (risk === 'Moderate') {
    summary = hr > 100 ? 'Heart rate is slightly high.' : 'Heart rate is slightly below average.';
    advice = 'Monitor your levels over the next few hours and avoid caffeine.';
  }
  
  return { risk, summary, advice, explanation: `Local app assessment based on the measured ${hr} BPM.` };
};
