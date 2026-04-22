import * as admin from "firebase-admin";
import { genkit } from "genkit";
import { z } from "zod";
import { googleAI } from "@genkit-ai/googleai";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

/* =========================================================
   INIT
========================================================= */

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * SECRETS SETUP
 * The secret handle used in Cloud Functions configuration.
 */
const googleApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

/* =========================================================
   GENKIT SETUP
   Using gemini-flash-latest for maximum intelligence.
========================================================= */

const ai = genkit({
  plugins: [googleAI()], // Automatically retrieves configured key at runtime
  model: "googleai/gemini-flash-latest", 
});

/* =========================================================
   1. HEART RATE FLOW
========================================================= */

const hrOutputSchema = z.object({
  risk: z.enum(["Low", "Moderate", "High", "Critical"]),
  explanation: z.string(),
  advice: z.string(),
  summary: z.string(),
});

const healthAnalysisFlow = ai.defineFlow(
  {
    name: "healthAnalysisFlow",
    inputSchema: z.object({ heartRate: z.number() }),
    outputSchema: hrOutputSchema,
  },
  async (input) => {
    const risk =
      input.heartRate > 130
        ? "Critical"
        : input.heartRate > 100
          ? "High"
          : input.heartRate > 90
            ? "Moderate"
            : "Low";

    const response = await ai.generate({
      prompt: `
Analyze heart rate: ${input.heartRate} bpm.
Risk level: ${risk}

Instructions:
- risk: EXACTLY ONE OF "Low", "Moderate", "High", "Critical".
- explanation: 2 sentences explaining the heart rate.
- advice: 1 actionable health sentence.
- summary: 1 short summary sentence.

IMPORTANT: Return EXACTLY a valid JSON object matching the requested schema. No other text.
      `,
      output: { schema: hrOutputSchema },
      config: { temperature: 0.1 },
    });

    if (!response.output) {
      throw new Error("AI failed to generate a valid health analysis.");
    }

    return response.output;
  },
);

/* =========================================================
   2. CHRONIC FLOW (RAG)
========================================================= */

const chronicOutputSchema = z.object({
  risk: z.enum(["Low", "Moderate", "High", "Critical"]),
  summary: z.string(),
  advice: z.string(),
});

const chronicAnalysisFlow = ai.defineFlow(
  {
    name: "chronicAnalysisFlow",
    inputSchema: z.object({
      userId: z.string(),
      heartRate: z.number().optional(),
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
      glucose: z.number().optional(),
      spo2: z.number().optional(),
    }),
    outputSchema: chronicOutputSchema,
  },
  async (input) => {
    const [hSnap, cSnap] = await Promise.all([
      admin
        .firestore()
        .collection("users")
        .doc(input.userId)
        .collection("heart_rate_logs")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get(),

      admin
        .firestore()
        .collection("users")
        .doc(input.userId)
        .collection("chronicVital_log")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get(),
    ]);

    const history = {
      hr: hSnap.docs.map((d) => d.data()),
      vitals: cSnap.docs.map((d) => d.data()),
    };

    const response = await ai.generate({
      prompt: `
Analyze patient health data.

CURRENT:
${JSON.stringify(input)}

HISTORY (Context):
${JSON.stringify(history).slice(0, 2000)}

Instructions:
- risk: EXACTLY ONE OF "Low", "Moderate", "High", "Critical". Do not use any other words.
- summary: max 12 words highlighting the most important trend.
- advice: clear medical instruction based on current and history data.

IMPORTANT: Return EXACTLY a valid JSON object matching the requested schema. Ensure 'risk' strictly matches the enum.
      `,
      output: { schema: chronicOutputSchema },
      config: { temperature: 0.1 },
    });

    const result = response.output;
    if (!result) {
      throw new Error("AI failed to generate a valid chronic analysis.");
    }

    // Persist the insight to Firestore for the workflow guard
    await admin.firestore().collection("users").doc(input.userId).collection("ai_insights").add({
      ...result,
      heartRate: input.heartRate || 72,
      date: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      vitalsRef: {
        systolic: input.systolic,
        diastolic: input.diastolic,
        glucose: input.glucose
      }
    });

    return result;
  },
);

/* =========================================================
   3. GRAPH TREND FLOW
========================================================= */

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

const graphAnalysisFlow = ai.defineFlow(
  {
    name: "graphAnalysisFlow",
    inputSchema: z.object({
      userId: z.string(),
      view: z.string(),
      metric: z.string(),
      data: z.array(z.any()),
    }),
    outputSchema: graphOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      prompt: `
Analyze ${input.metric} trends for ${input.view} view.

DATA:
${JSON.stringify(input.data).slice(0, 2000)}

Return:
- summary: Concise pattern evaluation.
- stability: (0-100) consistency score.
- trends: Array of objects with label, percentage change, and direction (direction MUST be "up", "down", or "stable").

IMPORTANT: Return EXACTLY a valid JSON object matching the requested schema. No markdown formatting outside of JSON.
      `,
      output: { schema: graphOutputSchema },
      config: { temperature: 0.1 },
    });

    if (!response.output) {
      throw new Error("AI failed to generate a valid graph analysis.");
    }

    return response.output;
  },
);

/* =========================================================
   4. CALLABLE FUNCTIONS
========================================================= */

export const healthAnalysis = onCall(
  { secrets: [googleApiKey], cors: true },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "User must be signed in.");

    const data = request.data || {};
    return await healthAnalysisFlow(data);
  },
);

export const chronicAnalysis = onCall(
  { secrets: [googleApiKey], cors: true },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "User must be signed in.");

    const userId = request.auth.uid;

    // WORKFLOW RULE: Check for new logs after latest AI reading
    const [latestLogSnap, latestInsightSnap] = await Promise.all([
      admin.firestore().collection("users").doc(userId).collection("chronicVital_log")
        .orderBy("createdAt", "desc").limit(1).get(),
      admin.firestore().collection("users").doc(userId).collection("ai_insights")
        .orderBy("createdAt", "desc").limit(1).get()
    ]);

    const latestLog = latestLogSnap.docs[0]?.data();
    const latestInsight = latestInsightSnap.docs[0]?.data();

    // If we have an insight and no newer log, tell the UI to ask for fresh data
    if (latestInsight && latestLog) {
      const logTime = latestLog.createdAt?.toDate ? latestLog.createdAt.toDate().getTime() : 0;
      const insightTime = latestInsight.createdAt?.toDate ? latestInsight.createdAt.toDate().getTime() : 0;
      
      if (logTime <= insightTime) {
        return {
          status: "pending_new_data",
          risk: latestInsight.risk,
          summary: "AI has already processed your most recent vitals. No new variations detected since the last deep scan.",
          advice: "To generate a fresh chronic analysis, please submit a new health log (Blood Pressure or Glucose). This ensures the AI model evaluates your current biological state rather than historical patterns.",
          needsNewInput: true
        };
      }
    }

    const data = request.data || {};
    return await chronicAnalysisFlow({
      ...data,
      userId,
    });
  },
);

export const graphAnalysis = onCall(
  { secrets: [googleApiKey], cors: true },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "User must be signed in.");

    const data = request.data || {};
    return await graphAnalysisFlow({
      userId: request.auth.uid,
      view: data.view || 'daily',
      metric: data.metric || 'heartRate',
      data: data.data || [],
    });
  },
);

/* =========================================================
   5. PUSH NOTIFICATION TRIGGER
========================================================= */

export const sendPushNotification = onDocumentCreated(
  {
    document: "users/{userId}/notifications/{notificationId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const notification = snap.data();
    const userId = event.params.userId;

    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token found for user ${userId}. Skipping push.`);
      return null;
    }

    const isEmergency = notification.type === "emergency";

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title || "Health Alert",
        body: notification.message || "New health update received.",
      },
      data: {
        type: notification.type || 'info',
        notificationId: snap.id,
      },
      android: {
        priority: isEmergency ? 'high' : 'normal',
        notification: {
          channelId: isEmergency ? 'emergency_alerts' : 'general_alerts',
          sound: isEmergency ? 'emergency_siren' : 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title || "Health Alert",
              body: notification.message || "New health update received.",
            },
            sound: isEmergency ? 'emergency_siren.caf' : 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`Successfully sent push to ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`Error sending push to ${userId}:`, error);
      
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token') {
        await admin.firestore().collection('users').doc(userId).update({ 
          fcmToken: admin.firestore.FieldValue.delete() 
        });
        console.log(`Removed invalid token for user ${userId}`);
      }
      return null;
    }
  },
);
