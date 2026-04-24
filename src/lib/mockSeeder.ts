import { 
  db, 
  collection, 
  doc, 
  writeBatch, 
  Timestamp, 
  serverTimestamp 
} from './firebase';

export const seed30DaysData = async (userId: string) => {
  const batch = writeBatch(db);
  const now = new Date();
  
  // Base values (can be slightly shifted per user if we wanted)
  const baseHr = 72;
  const baseSys = 120;
  const baseDia = 80;
  const baseGlu = 95;
  const baseWeight = 78;
  const baseHeight = 175;
  const baseSteps = 7000;

  console.log(`Starting seeding process for ${userId}...`);

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(12, 0, 0, 0); // Noon for consistency
    const timestamp = Timestamp.fromDate(date);

    // 1. Heart Rate Log
    const hrRef = doc(collection(db, 'users', userId, 'heart_rate_logs'));
    batch.set(hrRef, {
      heartRate: baseHr + Math.floor(Math.random() * 20) - 5,
      steps: Math.max(0, baseSteps + Math.floor(Math.random() * 5000) - 2000),
      createdAt: timestamp
    });

    // 2. Chronic Vital Log
    const chronicRef = doc(collection(db, 'users', userId, 'chronicVital_log'));
    batch.set(chronicRef, {
      systolic: baseSys + Math.floor(Math.random() * 25) - 10,
      diastolic: baseDia + Math.floor(Math.random() * 15) - 5,
      glucose: baseGlu + Math.floor(Math.random() * 40) - 15,
      spo2: 95 + Math.floor(Math.random() * 5),
      createdAt: timestamp
    });

    // 3. BMI Log (once a week)
    if (i % 7 === 0) {
      const weight = baseWeight + (Math.random() * 2 - 1);
      const bmi = weight / ((baseHeight / 100) ** 2);
      const bmiRef = doc(collection(db, 'users', userId, 'bmi_logs'));
      batch.set(bmiRef, {
        bmi: parseFloat(bmi.toFixed(1)),
        weight: parseFloat(weight.toFixed(1)),
        height: baseHeight,
        createdAt: timestamp
      });
    }

    // 4. Heart Rate Breakdown (24 entries per day for the last 3 days for graph testing, but let's do 1 per day for longer history)
    if (i < 7) {
      for (let h = 0; h < 24; h++) {
        const hourlyDate = new Date(date);
        hourlyDate.setHours(h);
        const hourlyHr = 60 + Math.floor(Math.random() * 40);
        const breakdownRef = doc(collection(db, 'users', userId, 'heart_rate_breakdown'));
        batch.set(breakdownRef, {
          heartRate: hourlyHr,
          hour: h,
          date: Timestamp.fromDate(hourlyDate)
        });
      }
    }

    // 5. AI Insights & Risk History (occasionally)
    if (i % 5 === 0) {
      const riskRef = doc(collection(db, 'risk_history'));
      batch.set(riskRef, {
        uid: userId,
        riskLevel: i % 15 === 0 ? 'High' : 'Low',
        summary: i % 15 === 0 ? "Elevated glucose levels detected consistently over 48 hours." : "Stable health metrics maintaining normal range.",
        advice: i % 15 === 0 ? "Reduce sugar intake and consult your physician." : "Keep up the good habits!",
        date: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString(),
        time: timestamp,
        vitals: {
          heartRate: baseHr + 10,
          systolic: baseSys + 5,
          glucose: baseGlu + 20
        },
        source: 'Automated Diagnostic'
      });
    }
  }

  await batch.commit();
  console.log(`Successfully seeded 30 days of history for ${userId}`);
  return true;
};
