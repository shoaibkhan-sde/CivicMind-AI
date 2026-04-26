import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, update, increment } from 'firebase/database';
import { database as db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { XP_LEVELS } from '../utils/constants';

const ProgressionContext = createContext();

// Helper to check if two dates are the same day
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Helper to check if date is exactly yesterday
const isYesterday = (date) => {
  if (!date) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

export function ProgressionProvider({ children }) {
  const { user } = useAuth();
  
  // ── Immediate Initialization (Sense Logic) ──
  const [xpState, setXpState] = useState(() => {
    const cachedXp = parseInt(localStorage.getItem('civic_xp_temp') || '0');
    const cachedStreak = parseInt(localStorage.getItem('civic_streak_temp') || '0');
    const cachedLastDate = localStorage.getItem('civic_last_date_temp');
    
    return {
      xp: cachedXp,
      level: 1,
      title: 'New Voter',
      streak: cachedStreak,
      lastActivityDate: cachedLastDate,
      progressToNext: 0,
      isTodayActive: cachedLastDate ? isSameDay(new Date(cachedLastDate), new Date()) : false
    };
  });

  const [notifications, setNotifications] = useState([]);

  const calculateLevel = useCallback((totalXp) => {
    let currentLevel = XP_LEVELS[0];
    for (const lvl of XP_LEVELS) {
      if (totalXp >= lvl.min) currentLevel = lvl;
      else break;
    }
    const nextLvl = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
    let progress = 100;
    if (nextLvl) {
      const range = nextLvl.min - currentLevel.min;
      const gained = totalXp - currentLevel.min;
      progress = Math.min(Math.floor((gained / range) * 100), 99);
    }
    return { ...currentLevel, progress };
  }, []);

  // ── Streak Maintenance & Level Update ──
  useEffect(() => {
    const today = new Date();
    const lastDate = xpState.lastActivityDate ? new Date(xpState.lastActivityDate) : null;
    
    // Check for streak reset (if missed more than 1 day)
    if (lastDate && !isSameDay(lastDate, today) && !isYesterday(lastDate)) {
      console.log('[CivicMind] ❄️ Streak expired. Resetting to 0.');
      setXpState(prev => {
        localStorage.setItem('civic_streak_temp', '0');
        return { ...prev, streak: 0 };
      });
    }

    const { level, title, progress } = calculateLevel(xpState.xp);
    setXpState(prev => {
      if (prev.level === level && prev.title === title && prev.progressToNext === progress) return prev;
      return { ...prev, level, title, progressToNext: progress };
    });
  }, [xpState.xp, xpState.lastActivityDate, calculateLevel]);

  // Sync with Firebase if available
  useEffect(() => {
    if (!user || !db) return;

    const userRef = ref(db, `users/${user.uid}/profile`);
    return onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const { level, title, progress } = calculateLevel(data.xp || 0);
        setXpState({
          xp: data.xp || 0,
          level,
          title,
          streak: data.streak || 0,
          lastActivityDate: data.lastActivityDate || null,
          progressToNext: progress,
        });
      }
    });
  }, [user, calculateLevel]);

  const updateStreak = useCallback(async () => {
    const today = new Date();
    const lastDate = xpState.lastActivityDate ? new Date(xpState.lastActivityDate) : null;

    // ── LeetCode Streak Logic ──
    if (lastDate && isSameDay(lastDate, today)) {
      console.log('[CivicMind] 🔥 Streak already earned today. Stay curious!');
      return;
    }

    let nextStreak = 1;
    if (lastDate && isYesterday(lastDate)) {
      nextStreak = xpState.streak + 1;
      console.log(`[CivicMind] 🔥 Streak continued! Day ${nextStreak}`);
    } else {
      console.log('[CivicMind] 🔥 New streak started!');
    }

    const dateStr = today.toISOString();
    
    setXpState(prev => {
      localStorage.setItem('civic_streak_temp', nextStreak.toString());
      localStorage.setItem('civic_last_date_temp', dateStr);
      return { ...prev, streak: nextStreak, lastActivityDate: dateStr, isTodayActive: true };
    });

    if (user && db) {
      const userRef = ref(db, `users/${user.uid}/profile`);
      await update(userRef, { 
        streak: nextStreak, 
        lastActivityDate: dateStr 
      });
    }
  }, [user, xpState.lastActivityDate, xpState.streak]);

  const addXP = useCallback(async (amount) => {
    setXpState(prev => {
      const newXp = prev.xp + amount;
      localStorage.setItem('civic_xp_temp', newXp.toString());
      return { ...prev, xp: newXp };
    });

    const id = Date.now();
    setNotifications(prev => [...prev, { id, amount }]);

    // 🔥 Automatically update streak when XP is earned (LeetCode Style)
    updateStreak();

    if (user && db) {
      const userRef = ref(db, `users/${user.uid}/profile`);
      await update(userRef, { xp: increment(amount) });
    }
  }, [user, updateStreak]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <ProgressionContext.Provider value={{ xpState, addXP, updateStreak, notifications, removeNotification }}>
      {children}
    </ProgressionContext.Provider>
  );
}

export const useProgression = () => useContext(ProgressionContext);
