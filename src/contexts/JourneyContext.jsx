import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ref, onValue, update } from 'firebase/database';
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

    if (!db) {
      // Demo Mode: Load from localStorage
      const localData = localStorage.getItem(`civic_journey_${user.uid}`);
      const localProgress = localStorage.getItem(`civic_progress_${user.uid}`);
      if (localData) {
        setCompletedStages(JSON.parse(localData));
      }
      if (localProgress) {
        setStageProgress(JSON.parse(localProgress));
      }
      setIsHydrated(true);
      return;
    }

    const journeyRef = ref(db, `users/${user.uid}/journey`);
    const unsubscribe = onValue(journeyRef, (snapshot) => {
      const data = snapshot.val() || {};
      const completed = Object.keys(data).filter(key => data[key] === true);
      setCompletedStages(completed);
      setIsHydrated(true);
    });

    return () => unsubscribe();
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
