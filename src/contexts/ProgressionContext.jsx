import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, update, increment } from 'firebase/database';
import { database as db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { XP_LEVELS } from '../utils/constants';
import { getLeague, DAILY_GOAL_XP } from '../utils/leagues';

const ProgressionContext = createContext();

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1), b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

const isYesterday = (date) => {
  if (!date) return false;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return isSameDay(date, y);
};

// Monday of current week (midnight UTC)
function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

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
      if (data) {
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
          league,
        }));
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
      const newXp = prev.xp + amount;
      const newWeekly = prev.weeklyXP + amount;
      const newDaily = prev.dailyXP + amount;
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
      await update(ref(db, `users/${user.uid}/profile`), {
        xp: increment(amount),
        weeklyXP: increment(amount),
      });
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
