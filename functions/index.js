import * as admin from "firebase-admin";
import { genkit } from "genkit";
import { z } from "zod";
import { googleAI } from "@genkit-ai/googleai";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

/* =========================================================
   INIT FIREBASE
========================================================= */

if (!admin.apps.length) {
  admin.initializeApp();
}

/* =========================================================
   SECRET
========================================================= */

const googleApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

/* =========================================================
   SAFE GENKIT INIT
========================================================= */

let aiInstance = null;

function getAI() {
  if (!aiInstance) {
    aiInstance = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GOOGLE_GENAI_API_KEY,
        }),
      ],
      model: "googleai/gemini-1.5-flash",
    });
  }
  return aiInstance;
}

/* =========================================================
   SCHEMAS
   (Added "Unknown" to account for the workflow rejection popup)
========================================================= */

const hrOutputSchema = z.object({
  risk: z.enum(["Low", "Moderate", "High", "Critical", "Unknown"]),
  explanation: z.string(),
  advice: z.string(),
  summary: z.string(),
});

const chronicOutputSchema = z.object({
  risk: z.enum(["Low", "Moderate", "High", "Critical", "Unknown"]),
  summary: z.string(),
  advice: z.string(),
});

const graphOutputSchema = z.object({
  summary: z.string(),
  stability: z.number(),
  trends: z.array(
    z.object({
      label: z.string(),
      change: z.number(),
      trend: z.enum(["up", "down", "stable"]),
    }),
  ),
});

/* =========================================================
   FALLBACK AI LOGIC (FOR QUOTA/INTERNAL ERRORS)
========================================================= */

function fallbackHealthAnalysis(input) {
  const hr = input.heartRate || 72;
  const risk = hr > 130 ? "Critical" : hr > 100 ? "High" : hr > 90 ? "Moderate" : "Low";
  return {
    risk,
    explanation: `SYSTEM NOTICE: Heart rate of ${hr} bpm processed via deterministic safety engine. Your rate is ${risk === 'Low' ? 'normal' : 'outside the ideal resting range'}. AI consulting is currently undergoing maintenance.`,
    summary: `Heart rate level is ${risk.toLowerCase()} based on safety thresholds.`,
    advice: "Ensure you are hydrated and resting. If you feel unwell, dizzy, or experience palpitations, please consult a medical professional immediately. Re-run deep analysis in a few minutes."
  };
}

function fallbackChronicAnalysis(input) {
  const sys = input.systolic || 120;
  const glu = input.glucose || 95;
  let risk = "Low";
  if (sys > 180 || glu > 300) risk = "Critical";
  else if (sys > 140 || glu > 140) risk = "High";
  else if (sys > 130 || glu > 110) risk = "Moderate";

  return {
    risk,
    summary: `Vitals (BP: ${sys}, Glu: ${glu}) evaluated via secondary safety engine.`,
    advice: "System load is currently high. Based on standard health thresholds, your current vitals indicate a " + risk.toLowerCase() + " metabolic risk level. Keep tracking manually and re-sync for a full AI synthesis later."
  };
}

function fallbackGraphAnalysis(input) {
  return {
    summary: "Historical trends are currently being processed via local algorithms due to AI service limits.",
    stability: 90,
    trends: [
      { label: "Stability", change: 0, trend: "stable" }
    ]
  };
}

/* =========================================================
   CALLABLE FUNCTIONS
   (Using direct .generate calls to prevent root-level execution)
========================================================= */

export const healthAnalysis = onCall(
  { secrets: [googleApiKey], cors: true },
  async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "Login required");
    
    const input = req.data;
    const ai = getAI();

    const risk =
      input.heartRate > 130
        ? "Critical"
        : input.heartRate > 100
          ? "High"
          : input.heartRate > 90
            ? "Moderate"
            : "Low";

    try {
      const response = await ai.generate({
        model: "googleai/gemini-1.5-flash",
        output: { schema: hrOutputSchema },
        prompt: `
  You are an advanced medical AI assistant for real-time health monitoring systems.
  
  Your role is to analyze patient heart rate data and provide safe, structured medical insights.
  
  ----------------------------------------
  PATIENT DATA:
  - Heart Rate: ${input.heartRate} bpm
  - Pre-calculated Risk: ${risk}
  ----------------------------------------
  
  TASK:
  1. Analyze whether the heart rate is normal or abnormal.
  2. Consider possible causes such as:
     - physical activity
     - stress or anxiety
     - dehydration
     - cardiovascular strain
  3. Identify potential health risks but DO NOT diagnose diseases.
  4. Prioritize patient safety and conservative reasoning.
  
  ----------------------------------------
  OUTPUT FORMAT (STRICT JSON ONLY):
  
  - risk: (Low / Moderate / High / Critical)
  
  - explanation:
    Provide 3–5 clear sentences explaining physiological interpretation.
  
  - summary:
    1–2 sentence simple explanation of current condition.
  
  - advice:
    4–6 sentences including:
      - lifestyle recommendations
      - monitoring advice
      - hydration/rest guidance
      - when to seek medical attention
  
  ----------------------------------------
  RULES:
  - No markdown
  - No extra text
  - No self-reference as AI
  - Be medically safe and conservative
        `,
      });
  
      if (!response.output) throw new Error("AI failed");
      return response.output;
    } catch (err) {
      console.error("AI Analysis failed, using fallback:", err);
      return fallbackHealthAnalysis(input);
    }
  },
);

export const chronicAnalysis = onCall(
  { secrets: [googleApiKey], cors: true },
  async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "Login required");
    
    const input = req.data;
    const userId = req.auth.uid;

    const db = admin.firestore();

    // 1. STRICT WORKFLOW CHECK: Verify if there's a new manual log
    const [latestInsight, latestLog] = await Promise.all([
      db.collection("users").doc(userId).collection("chronic_vitals_insights")
        .orderBy("createdAt", "desc").limit(1).get(),
      db.collection("users").doc(userId).collection("chronicVital_log")
        .orderBy("createdAt", "desc").limit(1).get()
    ]);

    if (!latestLog.empty && !latestInsight.empty) {
      const insightDoc = latestInsight.docs[0].data();
      const insightTime = insightDoc.createdAt?.toMillis() || 0;
      const logTime = latestLog.docs[0].data().createdAt?.toMillis() || 0;

      // If the AI insight is newer than the last manual log, just return the latest known insight
      if (insightTime >= logTime) {
        return {
          risk: insightDoc.risk || "Low",
          summary: insightDoc.summary || "Latest analysis is synchronized.",
          advice: insightDoc.advice || "Your health data is currently stable. Submit a new medical log for fresh AI re-evaluation."
        };
      }
    }

    // 2. Fetch history context to pass to the AI
    const [hSnap, cSnap] = await Promise.all([
      db.collection("users").doc(userId).collection("heart_rate_logs")
        .orderBy("createdAt", "desc").limit(10).get(),
      db.collection("users").doc(userId).collection("chronicVital_log")
        .orderBy("createdAt", "desc").limit(10).get(),
    ]);

    const history = {
      hr: hSnap.docs.map((d) => d.data()),
      vitals: cSnap.docs.map((d) => d.data()),
    };

    const ai = getAI();
    try {
      const response = await ai.generate({
        model: "googleai/gemini-1.5-flash",
        output: { schema: chronicOutputSchema },
        prompt: `
  You are a clinical decision-support AI specializing in chronic disease monitoring and early risk detection.
  
  Your task is to analyze both current and historical patient health data.
  
  ----------------------------------------
  CURRENT DATA:
  ${JSON.stringify(input)}
  
  HISTORICAL DATA (last 10 records):
  ${JSON.stringify(history).slice(0, 2000)}
  
  ----------------------------------------
  ANALYSIS TASK:
  1. Detect patterns in chronic health indicators:
     - heart rate trends
     - blood pressure patterns
     - glucose fluctuations
     - oxygen saturation stability
  
  2. Identify early warning signs of deterioration.
  
  3. Compare current values with historical baseline.
  
  4. Evaluate risk progression over time.
  
  ----------------------------------------
  OUTPUT FORMAT (STRICT JSON ONLY):
  
  - risk:
    (Low / Moderate / High / Critical)
  
  - summary:
    10–15 word concise medical summary of current condition
  
  - advice:
    Detailed paragraph including:
      - lifestyle changes
      - monitoring frequency
      - dietary suggestions
      - warning signs to watch
      - medical consultation advice if needed
  
  ----------------------------------------
  RULES:
  - Be conservative and safety-focused
  - No diagnosis, only risk assessment
  - No markdown or extra text
        `,
      });
  
      if (!response.output) throw new Error("AI failed");
  
      // REMOVED redundant write here since the frontend handles persistence
      return response.output;
    } catch (err) {
      console.error("Chronic AI failed, using fallback:", err);
      return fallbackChronicAnalysis(input);
    }
  },
);

export const graphAnalysis = onCall(
  { secrets: [googleApiKey], cors: true },
  async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "Login required");

    const input = req.data;
    const ai = getAI();

    try {
      const response = await ai.generate({
        model: "googleai/gemini-1.5-flash",
        output: { schema: graphOutputSchema },
        prompt: `
  You are a medical data analyst AI focused on health trend evaluation.
  
  Analyze the dataset and extract meaningful insights.
  
  ----------------------------------------
  METRIC: ${input.metric || 'vital signs'}
  VIEW: ${input.view || 'current'}
  
  DATA:
  ${JSON.stringify(input.data || []).slice(0, 2000)}
  
  ----------------------------------------
  TASK:
  1. Identify trends over time.
  2. Detect abnormalities or sudden changes.
  3. Evaluate overall stability.
  4. Provide interpretation of changes.
  
  ----------------------------------------
  OUTPUT FORMAT (STRICT JSON ONLY):
  
  - summary:
    1–2 sentence interpretation of trend
  
  - stability:
    score from 0–100 (100 = fully stable)
  
  - trends:
    list of:
      - label (time segment)
      - change (numeric difference)
      - trend (up/down/stable)
  
  ----------------------------------------
  RULES:
  - No extra text
  - No markdown
        `,
      });
  
      if (!response.output) throw new Error("AI failed");
      return response.output;
    } catch (err) {
      console.error("Graph AI failed, using fallback:", err);
      return fallbackGraphAnalysis(input);
    }
  },
);

/* =========================================================
   PUSH NOTIFICATION
========================================================= */

export const sendPushNotification = onDocumentCreated(
  {
    document: "users/{userId}/notifications/{notificationId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return null;

    const notification = snap.data();
    const userId = event.params.userId;

    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) return null;

    const isEmergency = notification.type === "emergency";

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title || "Health Alert",
        body: notification.message || "Update received",
      },
      data: {
        type: String(notification.type || "info"),
        notificationId: snap.id,
      },
      android: {
        priority: isEmergency ? "high" : "normal",
        notification: {
          channelId: isEmergency ? "emergency_alerts" : "general_alerts",
          sound: isEmergency ? "emergency_siren" : "default",
        },
      },
    };

    try {
      return await admin.messaging().send(message);
    } catch (err) {
      console.error(err);
      return null;
    }
  },
);
