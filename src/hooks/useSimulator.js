/**
 * @fileoverview useSimulator — Hook for the Candidate Simulation adventure.
 * Manages campaign stats, budget, scene transitions, and persistence.
 */

import { useState, useCallback, useEffect } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount when user is available
  useEffect(() => {
    if (user && !isLoaded) {
      const stored = localStorage.getItem(`civic_sim_${user.uid}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDay(parsed.day || 1);
          setBudget(parsed.budget !== undefined ? parsed.budget : STARTING_BUDGET);
          setStats(parsed.stats || INITIAL_STATS);
          setHistory(parsed.history || []);
          setPhase(parsed.phase || 'nomination');
          setIsGameOver(parsed.isGameOver || false);
        } catch (e) {
          console.error('Failed to parse simulation data', e);
        }
      }
      setIsLoaded(true);
    }
  }, [user, isLoaded]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (user && isLoaded) {
      const simData = { day, budget, stats, history, phase, isGameOver };
      localStorage.setItem(`civic_sim_${user.uid}`, JSON.stringify(simData));
    }
  }, [user, isLoaded, day, budget, stats, history, phase, isGameOver]);

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
      const nextDay = day + 1;
      setDay(nextDay);
      
      // Phase Transitions
      if (nextDay > 25) {
        setPhase('voting');
      } else if (nextDay > 5) {
        setPhase('campaign');
      } else {
        setPhase('nomination');
      }
    }
  }, [day]);

  const resetSim = useCallback(() => {
    setDay(1);
    setBudget(STARTING_BUDGET);
    setStats(INITIAL_STATS);
    setHistory([]);
    setPhase('nomination');
    setIsGameOver(false);
    if (user) {
      localStorage.removeItem(`civic_sim_${user.uid}`);
    }
  }, [user]);

  return {
    day,
    budget,
    stats,
    history,
    phase,
    isGameOver,
    makeDecision,
    resetSim,
    isLoaded // Can be used to prevent rendering UI until state is hydrated
  };
}
