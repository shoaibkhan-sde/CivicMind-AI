import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database as db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { JOURNEY_STAGES } from '../utils/constants';

export const JourneyContext = createContext();

export function JourneyProvider({ children }) {
  const { user } = useAuth();
  const [completedStages, setCompletedStages] = useState([]);
  const [stageProgress, setStageProgress] = useState({}); // { stageId: { currentIndex, masteredSteps } }
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with Firebase / Local Storage
  useEffect(() => {
    if (!user) return;

    // 1. Always load from localStorage to hydrate instantly and preserve data
    const localData = localStorage.getItem(`civic_journey_${user.uid}`);
    const localProgress = localStorage.getItem(`civic_progress_${user.uid}`);
    
    let initialCompleted = [];
    if (localData) {
      try {
        initialCompleted = JSON.parse(localData);
        setCompletedStages(initialCompleted);
      } catch (e) {
        console.error('Failed to parse local journey data');
      }
    }
    
    if (localProgress) {
      try {
        setStageProgress(JSON.parse(localProgress));
      } catch (e) {
        console.error('Failed to parse local progress data');
      }
    }
    
    setIsHydrated(true);

    // 2. If Firebase is active, sync and merge
    if (db) {
      const journeyRef = ref(db, `users/${user.uid}/journey`);
      const unsubscribe = onValue(journeyRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() || {};
          const completedFromDb = Object.keys(data).filter(key => data[key] === true);
          
          setCompletedStages(prev => {
            const merged = new Set([...prev, ...completedFromDb]);
            const mergedArray = Array.from(merged);
            // Save merged state back to local storage
            localStorage.setItem(`civic_journey_${user.uid}`, JSON.stringify(mergedArray));
            return mergedArray;
          });
        } else {
          // No data in Firebase (deleted), clear local state
          setCompletedStages([]);
          setStageProgress({});
          localStorage.removeItem(`civic_journey_${user.uid}`);
          localStorage.removeItem(`civic_progress_${user.uid}`);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const completeStage = useCallback(async (stageId) => {
    if (!user) return;

    // Update Local State Immediately
    setCompletedStages(prev => {
      if (prev.includes(stageId)) return prev;
      const next = [...prev, stageId];
      localStorage.setItem(`civic_journey_${user.uid}`, JSON.stringify(next));
      return next;
    });

    if (db) {
      const journeyRef = ref(db, `users/${user.uid}/journey`);
      await update(journeyRef, {
        [stageId]: true,
      });
    }
  }, [user]);

  const updateStageProgress = useCallback((stageId, progress) => {
    if (!user) return;
    setStageProgress(prev => {
      const next = { ...prev, [stageId]: { ...prev[stageId], ...progress } };
      localStorage.setItem(`civic_progress_${user.uid}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const resetJourney = useCallback(async () => {
    if (!user) return;
    
    // Clear Local Storage
    localStorage.removeItem(`civic_journey_${user.uid}`);
    localStorage.removeItem(`civic_progress_${user.uid}`);
    
    setCompletedStages([]);
    setStageProgress({});
    
    // Clear Firebase
    if (db) {
      const journeyRef = ref(db, `users/${user.uid}/journey`);
      try {
        return await remove(journeyRef);
      } catch (e) {
        console.error('Failed to reset journey on Firebase', e);
      }
    }
    return Promise.resolve();
  }, [user]);

  const currentStage = useMemo(() => {
    return JOURNEY_STAGES.find(s => !completedStages.includes(s.id)) || JOURNEY_STAGES[0];
  }, [completedStages]);

  const isLocked = useCallback((stageId) => {
    const stage = JOURNEY_STAGES.find(s => s.id === stageId);
    if (!stage) return true;
    if (stage.order === 1) return false;

    const prevStage = JOURNEY_STAGES.find(s => s.order === stage.order - 1);
    return !completedStages.includes(prevStage.id);
  }, [completedStages]);

  return (
    <JourneyContext.Provider value={{ 
      completedStages, 
      stageProgress,
      updateStageProgress,
      currentStage, 
      completeStage, 
      isLocked, 
      isHydrated,
      resetJourney,
      allStages: JOURNEY_STAGES 
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('useJourney must be used within a JourneyProvider');
  return context;
};
