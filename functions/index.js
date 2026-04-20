import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCallGenkit } from "@genkit-ai/firebase";
import { defineSecret } from "firebase-functions/params";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { z } from "zod";
import { HttpsError } from "firebase-functions/v2/https";

admin.initializeApp();

/* ---------------- SECRET ---------------- */

// We define both common secret names to ensure compatibility with your environment
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const googleApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

/* ---------------- GENKIT SETUP ---------------- */

/**
 * Helper to get a configured Genkit instance inside the execution context.
 * This ensures the secret key populated at runtime is used.
 */
function getAi() {
  // Use the binding from the secret definition
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("AI API Key Missing: Ensure GOOGLE_GENAI_API_KEY is configured in Firebase secrets.");
  }

  return genkit({
    plugins: [googleAI({ apiKey })],
    // gemini-1.5-flash is the most stable bridge for Genkit 0.9.x
    model: "googleai/gemini-1.5-flash",
  });
}

// Global instance for flow registration (plugins initialized without keys)
const ai = genkit({ plugins: [googleAI()] });

/* =========================
   CHRONIC FLOW (BP + GLUCOSE)
========================= */

const chronicInput = z.object({
  systolic: z.number().optional(),
  diastolic: z.number().optional(),
  glucose: z.number().optional(),
  heartRate: z.number().optional(),
  userId: z.string().optional(), // Optional for callable tracing
});

const chronicOutput = z.object({
  risk: z.enum(["Low", "Moderate", "High", "Critical"]),
  summary: z.string(),
  advice: z.string(),
});

export const chronicFlow = ai.defineFlow(
  {
    name: "chronicFlow",
    inputSchema: chronicInput,
    outputSchema: chronicOutput,
  },
  async (input) => {
    try {
      const activeAi = getAi();
      const res = await activeAi.generate({
        prompt: `
Analyze chronic health vitals for an elderly user (Aged Care Perspective).
Use standard clinical ranges (AHA/ADA) to determine stability.

VITALS LOGGED:
- Blood Pressure: ${input.systolic || "N/A"}/${input.diastolic || "N/A"} mmHg
- Blood Glucose: ${input.glucose || "N/A"} mg/dL
- Heart Rate: ${input.heartRate || "N/A"} BPM

DIAGNOSTIC CRITERIA:
1. BP: Normal (<120/80), Stage 1 HTN (130-139/80-89), Crisis (>=180/120).
2. Glucose (Fasting/Random): Normal (70-99/ <140), Prediabetes (100-125/ 140-199), Critical (>200 or <50).

REQUIREMENTS:
- risk: Assess the most critical marker (Low | Moderate | High | Critical).
- summary: Provide a professional clinical summary of how these metrics interact.
- advice: Give one actionable aged-care specific tip (monitoring, diet, or medical).

Response MUST be strictly JSON.
        `,
        output: { schema: chronicOutput },
      });

      const output = res.output || { risk: "Low", summary: "Data processing successful but results were ambiguous.", advice: "Ensure regular monitoring." };

      // If userId is provided (Callable path), save the result directly for UI persistence
      if (input.userId) {
        await admin.firestore()
          .collection("users")
          .doc(input.userId)
          .collection("ai_insights")
          .add({
            ...output,
            systolic: input.systolic || null,
            diastolic: input.diastolic || null,
            glucose: input.glucose || null,
            heartRate: input.heartRate || 0,
            source: 'Manual AI Request',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            date: admin.firestore.FieldValue.serverTimestamp(),
            bpGlucoseAnalysis: output
          });
      }

      return output;
    } catch (err) {
      console.error("Chronic Flow Error:", err);
      throw new HttpsError("internal", `Chronic analysis failed: ${err.message}`);
    }
  },
);

/* =========================
   CALLABLE FUNCTIONS
========================= */

// Enhanced callable that automatically routes the calling user's ID to the flow for saving
export const chronicAnalysis = onCallGenkit(
  { 
    secrets: [geminiApiKey, googleApiKey],
    authPolicy: (auth) => { if (!auth) throw new HttpsError('unauthenticated', 'User must be signed in.'); }
  },
  async (input, context) => {
    // Inject the user's ID from context into the flow input so the flow can save the result
    return await ai.runFlow(chronicFlow, {
      ...input,
      userId: context.auth.uid
    });
  }
);

/* =========================
   FIRESTORE TRIGGERS
========================= */

export const analyzeChronicVitals = onDocumentCreated(
  {
    document: "users/{userId}/heart_rate_logs/{logId}",
    secrets: [geminiApiKey, googleApiKey]
  },
  async (event) => {
    const snapshot = event.data;
    const userId = event.params.userId;

    if (!snapshot) return;

    const data = snapshot.data();

    // Only proceed if chronic markers are present
    if (!data.systolic && !data.glucose) return;

    try {
      const activeAi = getAi();
      const result = await activeAi.runFlow(chronicFlow, {
        systolic: data.systolic,
        diastolic: data.diastolic,
        glucose: data.glucose,
        heartRate: data.heartRate,
      });

      // Save insight to the user's collection
      await admin.firestore()
        .collection("users")
        .doc(userId)
        .collection("ai_insights")
        .add({
          ...result,
          systolic: data.systolic || null,
          diastolic: data.diastolic || null,
          glucose: data.glucose || null,
          heartRate: data.heartRate || 0,
          source: 'Automated Chronic Flow',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          date: admin.firestore.FieldValue.serverTimestamp(),
          bpGlucoseAnalysis: result
        });

      // Trigger high-risk notification
      if (result.risk === "High" || result.risk === "Critical") {
        await admin.firestore()
          .collection("users")
          .doc(userId)
          .collection("notifications")
          .add({
            title: `Chronic Alert: ${result.risk}`,
            message: result.summary,
            type: result.risk === "Critical" ? "emergency" : "warning",
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      }
    } catch (err) {
      console.error("Firestore Trigger Analysis Error:", err);
    }
  },
);

export const sendPushNotification = onDocumentCreated(
  "users/{userId}/notifications/{notificationId}",
  async (event) => {
    const snapshot = event.data;
    const userId = event.params.userId;

    if (!snapshot) return;

    const notification = snapshot.data();

    // Fetch user token
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    if (!userDoc.exists) return;

    const token = userDoc.data()?.fcmToken;
    if (!token) return;

    const isEmergency = notification?.type === "emergency";

    const message = {
      token,
      notification: {
        title: notification?.title || "Health Alert",
        body: notification?.message || "Check your health vitals.",
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
      await admin.messaging().send(message);
    } catch (err) {
      console.error("FCM Send Failure:", err);
    }
  },
);
