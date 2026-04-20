import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Activity } from "lucide-react";

import { StatCard } from "./StatCard";
import { getHRStatus, getBPStatus, getGlucoseStatus } from "../utils/health";
import { AIInsight, UserProfile } from "../types";
import { callChronicAI } from "../services/aiService";

interface DashboardTabProps {
  todayStats: any;
  profile: UserProfile | null;
  aiInsights: AIInsight[];
  isAnalyzing: boolean;
  onFindClinic: () => void;
}

export function DashboardTab({
  todayStats,
  profile,
  aiInsights,
  isAnalyzing,
  onFindClinic,
}: DashboardTabProps) {
  /* =========================
     STATE (AI)
  ========================= */
  const [chronicAI, setChronicAI] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  /* =========================
     CALL AI WHEN DATA CHANGES
  ========================= */
  useEffect(() => {
    const runAI = async () => {
      if (!todayStats) return;

      // prevent empty calls
      if (
        !todayStats.systolic &&
        !todayStats.glucose &&
        !todayStats.heartRate
      ) {
        return;
      }

      try {
        setLoadingAI(true);

        const result = await callChronicAI({
          systolic: todayStats.systolic,
          diastolic: todayStats.diastolic,
          glucose: todayStats.glucose,
          heartRate: todayStats.heartRate,
        });

        console.log("🔥 AI RESULT:", result);

        setChronicAI(result);
      } catch (err) {
        console.error("❌ AI ERROR:", err);
      } finally {
        setLoadingAI(false);
      }
    };

    runAI();
  }, [todayStats]);

  /* =========================
     UI
  ========================= */
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* =========================
          STATS
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Heart Rate"
          value={
            todayStats?.hasDataToday
              ? todayStats.heartRate?.toString() || "--"
              : "--"
          }
          unit="BPM"
          status={getHRStatus(todayStats?.heartRate)}
        />

        <StatCard
          label="Blood Pressure"
          value={
            todayStats?.hasDataToday && todayStats?.systolic
              ? `${todayStats.systolic}/${todayStats.diastolic}`
              : "--"
          }
          unit="mmHg"
          status={getBPStatus(todayStats?.systolic, todayStats?.diastolic)}
        />

        <StatCard
          label="Blood Glucose"
          value={
            todayStats?.hasDataToday && todayStats?.glucose
              ? todayStats.glucose.toString()
              : "--"
          }
          unit="mg/dL"
          status={getGlucoseStatus(todayStats?.glucose)}
        />

        <StatCard
          label="Steps Today"
          value={
            todayStats?.hasDataToday
              ? todayStats.steps?.toLocaleString()
              : "0"
          }
          unit="steps"
        />
      </div>

      {/* =========================
          PROFILE
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Weight" value={profile?.weight || "--"} unit="kg" />
        <StatCard label="Height" value={profile?.height || "--"} unit="cm" />
        <StatCard
          label="Age"
          value={profile?.age ? `${profile.age} yrs` : "--"}
          unit=""
        />
      </div>

      {/* =========================
          AI CARDS
      ========================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* =========================
            HEART RATE CARD (LOCAL)
        ========================= */}
        {(() => {
          const localHRAnalysis = getHRStatus(todayStats?.heartRate);

          const analysis = {
            risk: todayStats?.heartRate
              ? localHRAnalysis.level
              : "Low",
            summary:
              "Monitoring baseline heart rate patterns and cardiac variability.",
            advice:
              "Maintain a balanced activity level and stay hydrated.",
          };

          const latestRisk = analysis.risk;

          let bgClass = "ai-gradient-low";
          if (
            latestRisk.toLowerCase().includes("high") ||
            latestRisk.toLowerCase().includes("critical")
          )
            bgClass = "ai-gradient-high";
          else if (latestRisk.toLowerCase().includes("moderate"))
            bgClass = "ai-gradient-medium";

          return (
            <div
              className={`${bgClass} p-8 rounded-[32px] flex flex-col justify-between shadow-xl`}
            >
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Heart size={24} />
                  Heart Rate Status
                </h2>

                <p className="text-white/90 text-sm">
                  {analysis.summary}
                </p>

                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-xs text-white">
                    💡 {analysis.advice}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-white text-2xl font-bold">
                  {latestRisk}
                </div>
              </div>
            </div>
          );
        })()}

        {/* =========================
            CHRONIC AI CARD (REAL AI)
        ========================= */}
        {(() => {
          const analysis = chronicAI || {
            risk: "Standard",
            summary: loadingAI
              ? "Analyzing your vitals with AI..."
              : "No AI data yet.",
            advice: "Log your vitals to get AI insights.",
          };

          const latestRisk = analysis.risk;

          let bgClass = "ai-gradient-low";
          if (
            latestRisk.toLowerCase().includes("high") ||
            latestRisk.toLowerCase().includes("critical")
          )
            bgClass = "ai-gradient-high";
          else if (latestRisk.toLowerCase().includes("moderate"))
            bgClass = "ai-gradient-medium";

          return (
            <div
              className={`${bgClass} p-8 rounded-[32px] flex flex-col justify-between shadow-xl`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Activity size={24} />
                    Chronic Vitals AI
                  </h2>

                  {loadingAI && (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  )}
                </div>

                <p className="text-white/90 text-sm">
                  {analysis.summary}
                </p>

                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-xs text-white">
                    🛡️ {analysis.advice}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-white text-2xl font-bold">
                  {latestRisk}
                </div>

                {latestRisk.toLowerCase().includes("high") && (
                  <button
                    onClick={onFindClinic}
                    className="bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Clinic
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}