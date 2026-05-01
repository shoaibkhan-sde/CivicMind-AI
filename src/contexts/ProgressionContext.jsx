import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, update, increment } from 'firebase/database';
import { database as db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { XP_LEVELS } from '../utils/constants';
import { getLeague, DAILY_GOAL_XP } from '../utils/leagues';

/**
 * Context for managing user XP, levels, streaks, and league progression.
 */
const ProgressionContext = createContext();

/**
 * Checks if two dates are the same day (Year, Month, Date).
 * @param {string|Date} d1 
 * @param {string|Date} d2 
 * @returns {boolean}
 */
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1), b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

/**
 * Checks if a date was yesterday.
 * @param {string|Date} date 
 * @returns {boolean}
 */
const isYesterday = (date) => {
  if (!date) return false;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return isSameDay(date, y);
};

/**
 * Returns the ISO string for the start of the current week (Monday 00:00).
 * @returns {string}
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

/**
 * Provider for user progression state.
 * Manages XP, levels, streaks, and leagues with Firebase and LocalStorage sync.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ProgressionProvider({ children }) {
  const { user } = useAuth();

  const [xpState, setXpState] = useState(() => {
    const cachedXp = parseInt(localStorage.getItem('civic_xp_temp') || '0');
    const cachedStreak = parseInt(localStorage.getItem('civic_streak_temp') || '0');
    const cachedLastDate = localStorage.getItem('civic_last_date_temp');
    const cachedWeeklyXP = parseInt(localStorage.getItem('civic_weekly_xp') || '0');
    const cachedDailyXP = parseInt(localStorage.getItem('civic_daily_xp') || '0');
    const cachedDailyDate = localStorage.getItem('civic_daily_date');

    return {
      xp: cachedXp,
      level: 1,
      title: 'New Voter',
      streak: cachedStreak,
      lastActivityDate: cachedLastDate,
      progressToNext: 0,
      isTodayActive: cachedLastDate ? isSameDay(new Date(cachedLastDate), new Date()) : false,
      weeklyXP: cachedWeeklyXP,
      dailyXP: isSameDay(cachedDailyDate, new Date()) ? cachedDailyXP : 0,
      dailyGoal: DAILY_GOAL_XP,
      league: getLeague(cachedXp),
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

  // Streak + Level + League + Weekly XP maintenance
  useEffect(() => {
    const today = new Date();
    const lastDate = xpState.lastActivityDate ? new Date(xpState.lastActivityDate) : null;

    // Streak reset check
    if (lastDate && !isSameDay(lastDate, today) && !isYesterday(lastDate)) {
      setXpState(prev => {
        localStorage.setItem('civic_streak_temp', '0');
        return { ...prev, streak: 0 };
      });
    }

    // Weekly XP reset on Monday
    const weekStart = getWeekStart();
    const cachedWeekStart = localStorage.getItem('civic_week_start');
    if (cachedWeekStart !== weekStart) {
      localStorage.setItem('civic_week_start', weekStart);
      localStorage.setItem('civic_weekly_xp', '0');
      setXpState(prev => ({ ...prev, weeklyXP: 0 }));
    }

    // Daily XP reset
    const cachedDailyDate = localStorage.getItem('civic_daily_date');
    if (!isSameDay(cachedDailyDate, today)) {
      localStorage.setItem('civic_daily_xp', '0');
      localStorage.setItem('civic_daily_date', today.toISOString());
      setXpState(prev => ({ ...prev, dailyXP: 0 }));
    }

    const { level, title, progress } = calculateLevel(xpState.xp);
    const league = getLeague(xpState.xp);
    setXpState(prev => {
      if (prev.level === level && prev.title === title && prev.progressToNext === progress) return prev;
      return { ...prev, level, title, progressToNext: progress, league };
    });
  }, [xpState.xp, xpState.lastActivityDate, calculateLevel]);

  // Firebase sync
  useEffect(() => {
    if (!user || !db) return;
    const userRef = ref(db, `users/${user.uid}/profile`);
    return onValue(userRef, (snapshot) => {
      const data = snapshot.val();
        if (snapshot.exists()) {
          const data = snapshot.val();
          const { level, title, progress } = calculateLevel(data.xp || 0);
          const league = getLeague(data.xp || 0);
          setXpState(prev => ({
            ...prev,
            xp: data.xp || 0,
            level, title,
            streak: data.streak || 0,
            lastActivityDate: data.lastActivityDate || null,
            progressToNext: progress,
            isTodayActive: data.lastActivityDate ? isSameDay(new Date(data.lastActivityDate), new Date()) : false,
            weeklyXP: data.weeklyXP || 0,
            dailyXP: isSameDay(data.dailyDate, new Date()) ? (data.dailyXP || 0) : 0,
            league,
          }));
          // Sync local storage as well to prevent stale data on reload
          localStorage.setItem('civic_xp_temp', (data.xp || 0).toString());
          localStorage.setItem('civic_streak_temp', (data.streak || 0).toString());
          localStorage.setItem('civic_weekly_xp', (data.weeklyXP || 0).toString());
          if (data.dailyDate) {
            localStorage.setItem('civic_daily_xp', (isSameDay(data.dailyDate, new Date()) ? (data.dailyXP || 0) : 0).toString());
            localStorage.setItem('civic_daily_date', data.dailyDate);
          }
        } else {
          // Data deleted from Firebase, reset local state
          const fresh = {
            xp: 0, level: 1, title: 'New Voter', streak: 0, 
            lastActivityDate: null, progressToNext: 0, isTodayActive: false,
            weeklyXP: 0, dailyXP: 0, dailyGoal: DAILY_GOAL_XP,
            league: getLeague(0)
          };
          setXpState(fresh);
          // Also clear local storage to be sure
          const keys = ['civic_xp_temp', 'civic_streak_temp', 'civic_weekly_xp', 'civic_daily_xp', 'civic_daily_date', 'civic_last_date_temp'];
          keys.forEach(k => localStorage.removeItem(k));
        }
      });
  }, [user, calculateLevel]);

  const updateStreak = useCallback(async () => {
    const today = new Date();
    const lastDate = xpState.lastActivityDate ? new Date(xpState.lastActivityDate) : null;
    if (lastDate && isSameDay(lastDate, today)) return;

    let nextStreak = 1;
    if (lastDate && isYesterday(lastDate)) nextStreak = xpState.streak + 1;

    const dateStr = today.toISOString();
    setXpState(prev => {
      localStorage.setItem('civic_streak_temp', nextStreak.toString());
      localStorage.setItem('civic_last_date_temp', dateStr);
      return { ...prev, streak: nextStreak, lastActivityDate: dateStr, isTodayActive: true };
    });

    if (user && db) {
      await update(ref(db, `users/${user.uid}/profile`), { streak: nextStreak, lastActivityDate: dateStr });
    }
  }, [user, xpState.lastActivityDate, xpState.streak]);

  const addXP = useCallback(async (amount) => {
    setXpState(prev => {
      const newXp = Math.max(0, prev.xp + amount);
      const newWeekly = Math.max(0, prev.weeklyXP + amount);
      const newDaily = Math.max(0, prev.dailyXP + amount);
      localStorage.setItem('civic_xp_temp', newXp.toString());
      localStorage.setItem('civic_weekly_xp', newWeekly.toString());
      localStorage.setItem('civic_daily_xp', newDaily.toString());
      localStorage.setItem('civic_daily_date', new Date().toISOString());
      return { ...prev, xp: newXp, weeklyXP: newWeekly, dailyXP: newDaily, league: getLeague(newXp) };
    });

    const id = Date.now();
    setNotifications(prev => [...prev, { id, amount }]);
    updateStreak();

    if (user && db) {
      // Note: Firebase increment(negative) works fine, but we'll use a transaction style if we really want to cap at 0 in DB.
      // For now, simpler update:
      await update(ref(db, `users/${user.uid}/profile`), {
        xp: increment(amount),
        weeklyXP: increment(amount),
        dailyXP: increment(amount),
        dailyDate: new Date().toISOString()
      });
    }
  }, [user, updateStreak]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const resetProgression = useCallback(async () => {
    const freshState = {
      xp: 0,
      level: 1,
      title: 'New Voter',
      streak: 0,
      lastActivityDate: null,
      progressToNext: 0,
      isTodayActive: false,
      weeklyXP: 0,
      dailyXP: 0,
      dailyGoal: DAILY_GOAL_XP,
      league: getLeague(0),
    };

    setXpState(freshState);

    // Clear Local Storage selectively but thoroughly
    // We clear everything except the active tab and settings
    const allKeys = Object.keys(localStorage);
    const keysToClear = allKeys.filter(k => 
      k.startsWith('civic') && 
      k !== 'civic_active_tab' && 
      k !== 'civicmind_settings'
    );
    keysToClear.forEach(k => localStorage.removeItem(k));

    // Clear Firebase if logged in
    if (user && db) {
      try {
        return await update(ref(db, `users/${user.uid}/profile`), {
          xp: 0,
          streak: 0,
          lastActivityDate: null,
          weeklyXP: 0,
          dailyXP: 0,
          dailyDate: null,
          weeklyDate: null
        });
      } catch (e) {
        console.error('Firebase reset error', e);
      }
    }
    return Promise.resolve();
  }, [user]);

  return (
    <ProgressionContext.Provider value={{ xpState, addXP, updateStreak, resetProgression, notifications, removeNotification }}>
      {children}
    </ProgressionContext.Provider>
  );
}

/**
 * Custom hook to consume the ProgressionContext.
 * @returns {Object} { xpState, addXP, updateStreak, resetProgression, notifications, removeNotification }
 */
export const useProgression = () => useContext(ProgressionContext);
