/**
 * @fileoverview useConfusion — Detects user struggle and triggers Sage.
 */

import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Monitors quiz performance and timing to detect confusion.
 * @param {Object} options
 * @param {number} options.wrongCount - Number of consecutive wrong answers
 * @param {boolean} options.isActive - Is the user currently in a task
 * @returns {Object} { isConfused, triggerTopic }
 */
export default function useConfusion({ wrongCount, isActive }) {
  const [isConfused, setIsConfused] = useState(false);
  const [timer, setTimer] = useState(0);

  // 1. Monitor wrong answers
  useEffect(() => {
    if (wrongCount >= 2) {
      setIsConfused(true);
      logger.info('Confusion detected: High wrong answer count');
    } else {
      setIsConfused(false);
    }
  }, [wrongCount]);

  // 2. Monitor time on task
  useEffect(() => {
    let interval;
    if (isActive && !isConfused) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      setTimer(0);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, isConfused]);

  useEffect(() => {
    if (timer > 45) {
      setIsConfused(true);
      logger.info('Confusion detected: Time threshold exceeded (45s)');
    }
  }, [timer]);

  const resetConfusion = useCallback(() => {
    setIsConfused(false);
    setTimer(0);
  }, []);

  return { isConfused, resetConfusion };
}
