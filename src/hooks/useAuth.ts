import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Bootstrap user profile if it doesn't exist to ensure security rules are satisfied for first-time writes
        try {
          const profileRef = doc(db, 'users', u.uid);
          const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            await setDoc(profileRef, {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName || 'Vital User',
              role: 'patient',
              createdAt: serverTimestamp()
            });
          }
        } catch (e) {
          console.warn('Profile bootstrap skipped:', e);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (d) => {
      if (d.exists()) {
        setProfile(d.data() as UserProfile);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return { user, profile, loading };
}
