/**
 * @fileoverview useSimulator — Hook for the Candidate Simulation adventure.
 * Manages campaign stats, budget, and scene transitions.
 */

import { useState, useCallback, useMemo } from 'react';
import useAuth from './useAuth';

const INITIAL_STATS = {
  trust: 40,
  reach: 20,
  momentum: 30,
  corruption: 0,
};

const STARTING_BUDGET = 500000;

/**
 * Manages simulation state and decision logic.
 * @returns {Object}
 */
export default function useSimulator() {
  const { user } = useAuth();
  const [day, setDay] = useState(1);
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState('nomination'); // nomination | campaign | voting | results
  const [isGameOver, setIsGameOver] = useState(false);

  /**
   * Process a user decision.
   * @param {Object} choice - The selected choice object from constants
   */
  const makeDecision = useCallback(async (choice) => {
    // 1. Update stats and budget
    setBudget(prev => prev - (choice.cost || 0));
    setStats(prev => {
      const newStats = { ...prev };
      Object.keys(choice.stats).forEach(key => {
        newStats[key] = Math.max(0, Math.min(100, (newStats[key] || 0) + choice.stats[key]));
      });
      return newStats;
    });

    // 2. Log history
    setHistory(prev => [...prev, { 
      day, 
      choiceId: choice.id, 
      text: choice.text,
      lesson: choice.lesson 
    }]);

    // 3. Increment day or phase
    if (day >= 30) {
      setIsGameOver(true);
      setPhase('results');
    } else {
      setDay(prev => prev + 1);
    }
    
    // In a real app, we would call /api/simulate here to get narrative
  }, [day]);

  const resetSim = useCallback(() => {
    setDay(1);
    setBudget(STARTING_BUDGET);
    setStats(INITIAL_STATS);
    setHistory([]);
    setPhase('nomination');
    setIsGameOver(false);
  }, []);

  return {
    day,
    budget,
    stats,
    history,
    phase,
    isGameOver,
    makeDecision,
    resetSim
  };
}
