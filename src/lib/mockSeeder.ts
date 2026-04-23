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
  
  // Base values for Chairis Pum
  const baseHr = 72;
  const baseSys = 120;
  const baseDia = 80;
  const baseGlu = 95;
  const baseBMI = 24.5;
  const baseSteps = 6000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const timestamp = Timestamp.fromDate(date);

    // 1. Heart Rate Log
    const hrRef = doc(collection(db, 'users', userId, 'heart_rate_logs'));
    batch.set(hrRef, {
      heartRate: baseHr + Math.floor(Math.random() * 15) - 5,
      steps: baseSteps + Math.floor(Math.random() * 4000) - 1000,
      createdAt: timestamp
    });

    // 2. Chronic Vital Log
    const chronicRef = doc(collection(db, 'users', userId, 'chronicVital_log'));
    batch.set(chronicRef, {
      systolic: baseSys + Math.floor(Math.random() * 20) - 5,
      diastolic: baseDia + Math.floor(Math.random() * 10) - 2,
      glucose: baseGlu + Math.floor(Math.random() * 30) - 10,
      spo2: 96 + Math.floor(Math.random() * 4),
      createdAt: timestamp
    });

    // 3. BMI Log (every 3rd day to be realistic)
    if (i % 3 === 0) {
      const bmiRef = doc(collection(db, 'users', userId, 'bmi_logs'));
      batch.set(bmiRef, {
        bmi: baseBMI + (Math.random() * 0.5 - 0.25),
        weight: 75 + (Math.random() * 0.8 - 0.4),
        height: 175,
        createdAt: timestamp
      });
    }

    // 4. Risk History entry
    const riskRef = doc(collection(db, 'risk_history'));
    batch.set(riskRef, {
      uid: userId,
      riskLevel: 'Low',
      summary: `End-of-day summary for ${date.toLocaleDateString()}`,
      advice: 'Maintain current activity levels and hydration.',
      date: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' ' + date.toLocaleDateString(),
      time: timestamp,
      vitals: {
        heartRate: baseHr + 2,
        systolic: baseSys + 2,
        glucose: baseGlu + 5
      },
      source: 'Daily Sync'
    });
  }

  await batch.commit();
  return true;
};
