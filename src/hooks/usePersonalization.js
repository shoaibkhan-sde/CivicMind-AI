/**
 * @fileoverview usePersonalization — Hook for tracking user learning preferences.
 * Detects if a user prefers simulations, quizzes, or reading.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { database as db } from '../firebase';
import useAuth from './useAuth';

/**
 * Manages user profile personalization and learning style detection.
 * @returns {Object} { profile, updatePreference }
 */
export default function usePersonalization() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    preferredLearningStyle: 'reading',
    weakTopics: [],
    strongTopics: [],
    totalTimeMinutes: 0,
  });

  // Sync with Firebase
  useEffect(() => {
    if (!user) return;

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfile(prev => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Updates a specific profile field.
   * @param {string} field 
   * @param {any} value 
   */
  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const profileRef = ref(db, `users/${user.uid}/profile`);
    await update(profileRef, updates);
  }, [user]);

  /**
   * Automatically detect learning style based on time spent.
   * (Logic would be triggered from App.jsx or a layout component)
   */
  const detectLearningStyle = useCallback((stats) => {
    const { simTime, quizTime, journeyTime } = stats;
    let style = 'reading';
    if (simTime > quizTime && simTime > journeyTime) style = 'simulation';
    if (quizTime > simTime && quizTime > journeyTime) style = 'quiz';
    
    updateProfile({ preferredLearningStyle: style });
  }, [updateProfile]);

  return { profile, updateProfile, detectLearningStyle };
}
