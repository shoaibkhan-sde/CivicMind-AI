import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { auth, database } from '../firebase.js';
import logger from '../utils/logger.js';

export const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  preferences: { theme: 'system', fontSize: 16, avatar: null },
  ai: { style: 'standard', difficulty: 'medium' },
  notifications: { email: true, push: false },
  learningData: { useLearningData: true, weakTopics: [], userLevel: 'beginner' },
  updatedAt: 0,
};

// Merge deep to ensure missing keys from schema changes are populated
const mergeSettings = (local, incoming) => {
  return {
    preferences: { ...DEFAULT_SETTINGS.preferences, ...local?.preferences, ...incoming?.preferences },
    ai: { ...DEFAULT_SETTINGS.ai, ...local?.ai, ...incoming?.ai },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...local?.notifications, ...incoming?.notifications },
    learningData: { ...DEFAULT_SETTINGS.learningData, ...local?.learningData, ...incoming?.learningData },
    updatedAt: incoming?.updatedAt || local?.updatedAt || 0,
  };
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('civicmind_settings');
      return cached ? mergeSettings(DEFAULT_SETTINGS, JSON.parse(cached)) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });
  
  const [isHydrated, setIsHydrated] = useState(false);
  const syncTimeoutRef = useRef(null);
  const offlineQueueRef = useRef([]);

  // 1. Hydrate from Firebase
  useEffect(() => {
    let unsubscribeDb = null;
    let hydrationTimeout = setTimeout(() => {
      setIsHydrated(true); // Force hydration after 2 seconds
    }, 2000);

    if (!auth || !database) {
      clearTimeout(hydrationTimeout);
      setIsHydrated(true); // Demo mode / No firebase
      return;
    }

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user && !user.isAnonymous) {
        const settingsRef = ref(database, `users/${user.uid}/settings`);
        unsubscribeDb = onValue(settingsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setSettings((currentLocal) => {
              if (data.updatedAt >= currentLocal.updatedAt || currentLocal.updatedAt === 0) {
                const merged = mergeSettings(currentLocal, data);
                localStorage.setItem('civicmind_settings', JSON.stringify(merged));
                return merged;
              }
              return currentLocal;
            });
          }
          clearTimeout(hydrationTimeout);
          setIsHydrated(true);
        }, (error) => {
          logger.error('Failed to sync settings from Firebase', error);
          clearTimeout(hydrationTimeout);
          setIsHydrated(true); // Fallback to local
        });
      } else {
        if (unsubscribeDb) {
          unsubscribeDb();
          unsubscribeDb = null;
        }
        clearTimeout(hydrationTimeout);
        setIsHydrated(true); // Guest or not logged in
      }
    });

    return () => {
      clearTimeout(hydrationTimeout);
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, []);

  // 2. Offline Queue flush
  useEffect(() => {
    const handleOnline = async () => {
      if (offlineQueueRef.current.length > 0 && auth?.currentUser && !auth.currentUser.isAnonymous) {
        logger.info('Back online, flushing settings queue...');
        const latestSettings = offlineQueueRef.current[offlineQueueRef.current.length - 1];
        offlineQueueRef.current = [];
        
        try {
          await set(ref(database, `users/${auth.currentUser.uid}/settings`), latestSettings);
        } catch (e) {
          logger.error('Failed to flush offline settings queue', e);
          offlineQueueRef.current.push(latestSettings); // requeue
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // 3. Debounced Save with Rollback
  const updateSettings = useCallback((category, newValues) => {
    setSettings((prev) => {
      const nextSettings = {
        ...prev,
        [category]: { ...prev[category], ...newValues },
        updatedAt: Date.now(),
      };

      // Optimistic update to UI and local cache
      localStorage.setItem('civicmind_settings', JSON.stringify(nextSettings));

      if (!auth?.currentUser || auth.currentUser.isAnonymous) {
        return nextSettings; // Guests only use local storage
      }

      // Debounced Firebase Write O(1)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        if (!navigator.onLine) {
          offlineQueueRef.current.push(nextSettings);
          return;
        }

        try {
          await set(ref(database, `users/${auth.currentUser.uid}/settings`), nextSettings);
        } catch (error) {
          logger.error('Firebase save failed, rolling back settings', error);
          // Deterministic Rollback
          setSettings(prev);
          localStorage.setItem('civicmind_settings', JSON.stringify(prev));
        }
      }, 500);

      return nextSettings;
    });
  }, []);

  // 4. Apply UI Preferences to DOM
  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.preferences.theme;
    const fontSize = settings.preferences.fontSize;

    // Apply Theme
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Apply Font Size
    root.style.setProperty('--base-font-size', `${fontSize}px`);
  }, [settings.preferences.theme, settings.preferences.fontSize]);
  const value = {
    settings,
    updateSettings,
    isHydrated,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
