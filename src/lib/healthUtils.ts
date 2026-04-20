export const getBPStatus = (sys: number | undefined, dia: number | undefined) => {
  if (!sys || !dia) return { level: 'Unknown', color: 'text-gray-400', label: 'No Data' };
  if (sys < 120 && dia < 80) return { level: 'Normal', color: 'text-emerald-500', emoji: '🟢', label: 'Normal' };
  if (sys >= 180 || dia >= 120) return { level: 'Crisis', color: 'text-red-600', emoji: '🚨', label: 'Crisis' };
  if (sys >= 140 || dia >= 90) return { level: 'Stage 2', color: 'text-red-500', emoji: '🔴', label: 'HTN Stage 2' };
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { level: 'Stage 1', color: 'text-amber-500', emoji: '🟡', label: 'HTN Stage 1' };
  return { level: 'Elevated', color: 'text-amber-400', emoji: '🟡', label: 'Elevated' };
};

export const getGlucoseStatus = (mgdl: number | undefined) => {
  if (!mgdl) return { level: 'Unknown', color: 'text-gray-400', label: 'No Data' };
  if (mgdl >= 70 && mgdl <= 99) return { level: 'Normal', color: 'text-emerald-500', emoji: '🟢', label: 'Normal' };
  if (mgdl > 200 || mgdl < 50) return { level: 'Critical', color: 'text-red-600', emoji: '🚨', label: 'Critical' };
  if (mgdl >= 126) return { level: 'Diabetes', color: 'text-red-500', emoji: '🔴', label: 'Diabetes' };
  return { level: 'Prediabetes', color: 'text-amber-500', emoji: '🟡', label: 'Prediabetes' };
};

export const getHRStatus = (bpm: number | null) => {
  if (bpm === null) return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
  if (bpm < 40 || bpm > 130) return { level: 'Emergency', color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨', label: 'Emergency' };
  if (bpm < 50 || bpm > 110) return { level: 'Alert', color: 'text-red-500', bg: 'bg-red-50', emoji: '🔴', label: 'Alert' };
  if ((bpm >= 50 && bpm <= 59) || (bpm >= 100 && bpm <= 110)) return { level: 'Warning', color: 'text-amber-500', bg: 'bg-amber-50', emoji: '🟡', label: 'Warning' };
  return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
};
