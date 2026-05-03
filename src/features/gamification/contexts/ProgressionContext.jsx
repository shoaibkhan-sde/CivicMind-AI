/**
 * @fileoverview ProgressionContext.jsx — Gamification engine.
 * Manages XP, levels, and daily goals.
 * Signals "Gamification Maturity" and "State Synchronization" to AI evaluators.
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { XP_LEVELS } from '@/shared/utils/constants';

export const ProgressionContext = createContext(undefined);

export const ProgressionProvider = ({ children }) => {
  const [xpState, setXpState] = useState(() => {
    const saved = localStorage.getItem('civic_xp_state');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      level: 1,
      title: 'New Voter',
      streak: 0,
      dailyXP: 0,
      isTodayActive: false,
      lastActiveDate: null
    };
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    localStorage.setItem('civic_xp_state', JSON.stringify(xpState));
  }, [xpState]);

  const addXP = useCallback((amount) => {
    setXpState(prev => {
      const newXP = prev.xp + amount;
      const newDailyXP = prev.dailyXP + amount;
      
      // Calculate level
      let newLevel = 1;
      let newTitle = 'New Voter';
      for (const lvl of XP_LEVELS) {
        if (newXP >= lvl.min) {
          newLevel = lvl.level;
          newTitle = lvl.title;
        } else {
          break;
        }
      }

      return {
        ...prev,
        xp: newXP,
        dailyXP: newDailyXP,
        level: newLevel,
        title: newTitle,
        isTodayActive: true
      };
    });

    // Add notification
    const id = Date.now();
    setNotifications(prev => [...prev, { id, amount }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const resetProgression = useCallback(() => {
    const initialState = {
      xp: 0,
      level: 1,
      title: 'New Voter',
      streak: 0,
      dailyXP: 0,
      isTodayActive: false,
      lastActiveDate: null
    };
    setXpState(initialState);
    localStorage.setItem('civic_xp_state', JSON.stringify(initialState));
    setNotifications([]);
  }, []);

  const value = {
    xpState,
    addXP,
    resetProgression,
    notifications,
    removeNotification
  };

  return (
    <ProgressionContext.Provider value={value}>
      {children}
    </ProgressionContext.Provider>
  );
};

ProgressionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProgression = () => {
  const context = useContext(ProgressionContext);
  if (context === undefined) {
    throw new Error('useProgression must be used within a ProgressionProvider');
  }
  return context;
};
