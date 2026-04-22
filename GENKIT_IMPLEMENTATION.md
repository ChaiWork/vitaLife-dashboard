import { defineFlow, run } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { onCallV2 } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { configureGenkit } from '@genkit-ai/core';

// Configure Genkit with Google AI plugin
configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

/**
 * Chronic Vitals Analysis Flow
 * Analyzes Blood Pressure and Glucose levels to provide a risk assessment.
 */
export const chronicAnalysisFlow = defineFlow(
  {
    name: 'chronicAnalysis',
    inputSchema: z.object({
      heartRate: z.number().nullable().optional(),
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
      glucose: z.number().optional(),
      spo2: z.number().nullable().optional(),
      age: z.number().optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
    }),
    outputSchema: z.object({
      risk: z.enum(['Low', 'Moderate', 'High', 'Critical']),
      summary: z.string(),
      advice: z.string(),
    }),
  },
  async (input) => {
    const prompt = `
      Analyze the following health vitals for a patient:
      - Blood Pressure: ${input.systolic ?? 'N/A'}/${input.diastolic ?? 'N/A'} mmHg
      - Blood Glucose: ${input.glucose ?? 'N/A'} mg/dL
      - Heart Rate: ${input.heartRate ?? 'N/A'} BPM
      - SpO2: ${input.spo2 ?? 'N/A'}%
      - Age: ${input.age ?? 'N/A'}
      - Weight: ${input.weight ?? 'N/A'} kg
      - Height: ${input.height ?? 'N/A'} cm

      Provide a clinical risk assessment for metabolic and cardiovascular health.
      If BP > 180/120 or Glucose > 300, mark risk as 'Critical'.
      If BP > 140/90 or Glucose > 180, mark risk as 'High'.
      If BP > 130/85 or Glucose > 140, mark risk as 'Moderate'.
      Otherwise mark as 'Low'.

      Response must be in JSON format with fields: risk, summary, advice.
    `;

    const llmResponse = await run('call-llm', async () => {
      const result = await ai.generate({
        model: "googleai/gemini-2.5-flash",
        prompt: prompt,
        config: {
          temperature: 0.2,
        },
      });
      return result.output;
    });

    // Parse and return the structured data
    // Note: In a real implementation, you would use a tool or structured output from Genkit.
    // This is a simplified version for implementation reference.
    return llmResponse as any;
  }
);

/**
 * Firebase Function wrapper for the Genkit flow.
 */
export const chronicAnalysis = onCallV2(async (request) => {
  return await chronicAnalysisFlow(request.data);
});
