/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from '../lib/firebase';

export const saveManualVitals = async (uid: string, vitals: { hr: string, systolic: string, diastolic: string, glucose: string, steps: string, spo2: string }) => {
  const logRef = doc(collection(db, 'users', uid, 'heart_rate_logs'));
  await setDoc(logRef, {
    heartRate: Number(vitals.hr),
    systolic: vitals.systolic ? Number(vitals.systolic) : null,
    diastolic: vitals.diastolic ? Number(vitals.diastolic) : null,
    glucose: vitals.glucose ? Number(vitals.glucose) : null,
    steps: vitals.steps ? Number(vitals.steps) : 0,
    spo2: vitals.spo2 ? Number(vitals.spo2) : null,
    createdAt: serverTimestamp()
  });
};

export const deleteNotification = async (uid: string, notifId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'notifications', notifId));
};

export const markAllNotificationsRead = async (uid: string, notifications: any[]) => {
  const batch = writeBatch(db);
  notifications.forEach(n => {
    if (!n.read) {
      batch.update(doc(db, 'users', uid, 'notifications', n.id), { read: true });
    }
  });
  await batch.commit();
};

export const clearAllNotifications = async (uid: string, notifications: any[]) => {
  const batch = writeBatch(db);
  notifications.forEach(n => {
    batch.delete(doc(db, 'users', uid, 'notifications', n.id));
  });
  await batch.commit();
};

export const addFamilyMember = async (uid: string, currentUserEmail: string, email: string) => {
  if (!email || email === currentUserEmail) {
    throw new Error('Please enter a valid email address different from your own.');
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('User not found. Please ensure they have a VitaLife account.');
  }

  const memberData = querySnapshot.docs[0].data();
  const memberUid = querySnapshot.docs[0].id;

  const familyRef = doc(db, 'users', uid, 'family_links', memberUid);
  await setDoc(familyRef, {
    memberUid,
    displayName: memberData.displayName || memberData.fullName || 'Family Member',
    email: memberData.email,
    relation: 'Family',
    status: 'active',
    createdAt: serverTimestamp()
  });

  return memberData;
};

export const removeFamilyMember = async (uid: string, memberUid: string) => {
  await deleteDoc(doc(db, 'users', uid, 'family_links', memberUid));
};

export const updateProfile = async (uid: string, profileData: any) => {
  await setDoc(doc(db, 'users', uid), profileData, { merge: true });
};
