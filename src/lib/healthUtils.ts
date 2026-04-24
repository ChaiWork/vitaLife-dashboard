export const getBPStatus = (sys: number | undefined, dia: number | undefined) => {
  if (!sys || !dia) return { level: 'Unknown', color: 'text-gray-400', label: 'No Data' };
  
  // Crisis / Emergency
  if (sys >= 180 || dia >= 120) return { level: 'Crisis', color: 'text-red-600', emoji: '🚨', label: 'Crisis' };
  
  // High Risk / Stage 2
  if (sys >= 140 || dia >= 90) return { level: 'Stage 2', color: 'text-red-500', emoji: '🔴', label: 'HTN Stage 2' };
  
  // Moderate Risk / Stage 1
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { level: 'Stage 1', color: 'text-amber-500', emoji: '🟡', label: 'HTN Stage 1' };
  
  // Elevated
  if (sys >= 120 && sys <= 129 && dia < 80) return { level: 'Elevated', color: 'text-amber-400', emoji: '🟡', label: 'Elevated' };
  
  // Low (Hypotension)
  if (sys < 90 || dia < 60) return { level: 'Low BP', color: 'text-red-500', emoji: '⚠️', label: 'Hypotension' };
  
  // Normal
  return { level: 'Normal', color: 'text-emerald-500', emoji: '🟢', label: 'Normal' };
};

export const getGlucoseStatus = (mgdl: number | undefined) => {
  if (!mgdl) return { level: 'Unknown', color: 'text-gray-400', label: 'No Data' };
  
  // High Range
  if (mgdl > 200) return { level: 'Critical', color: 'text-red-600', emoji: '🚨', label: 'Hyperglycemia' };
  if (mgdl >= 126) return { level: 'Diabetes', color: 'text-red-500', emoji: '🔴', label: 'Diabetes' };
  if (mgdl >= 100) return { level: 'Prediabetes', color: 'text-amber-500', emoji: '🟡', label: 'Prediabetes' };
  
  // Low Range
  if (mgdl < 54) return { level: 'Critical Low', color: 'text-red-600', emoji: '🚨', label: 'Severe Hypo' };
  if (mgdl < 70) return { level: 'Low', color: 'text-red-500', emoji: '⚠️', label: 'Hypoglycemia' };
  
  // Normal
  return { level: 'Normal', color: 'text-emerald-500', emoji: '🟢', label: 'Normal' };
};

export const getHRStatus = (bpm: number | null) => {
  if (bpm === null) return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
  if (bpm < 40 || bpm > 130) return { level: 'Emergency', color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨', label: 'Emergency' };
  if (bpm < 50 || bpm > 110) return { level: 'Alert', color: 'text-red-500', bg: 'bg-red-50', emoji: '🔴', label: 'Alert' };
  if ((bpm >= 50 && bpm <= 59) || (bpm >= 100 && bpm <= 110)) return { level: 'Warning', color: 'text-amber-500', bg: 'bg-amber-50', emoji: '🟡', label: 'Warning' };
  return { level: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🟢', label: 'Normal' };
};
