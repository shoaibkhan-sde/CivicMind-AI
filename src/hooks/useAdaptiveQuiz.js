/**
 * @fileoverview useAdaptiveQuiz — Hook for the adaptive quiz engine.
 * Manages difficulty scaling and question selection logic.
 */

import { useState, useCallback, useMemo } from 'react';
import { QUESTION_BANK } from '../utils/constants';

/**
 * Logic for the adaptive quiz.
 * @param {string} stageId
 * @returns {Object}
 */
export default function useAdaptiveQuiz(stageId) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [difficulty, setDifficulty] = useState('easy'); // easy | medium | hard
  const [wrongTopics, setWrongTopics] = useState([]);
  const [history, setHistory] = useState([]);

  // Filter bank by stage
  const stageBank = useMemo(() => {
    return QUESTION_BANK.filter(q => q.stage === stageId);
  }, [stageId]);

  // Current question based on index and difficulty
  // In a real app, this would be more complex (finding next question with same difficulty)
  const currentQuestion = useMemo(() => {
    return stageBank[currentIdx];
  }, [stageBank, currentIdx]);

  const processAnswer = useCallback((isCorrect, topic) => {
    setHistory(prev => [...prev, isCorrect]);

    if (isCorrect) {
      // Scale up difficulty
      if (difficulty === 'easy') setDifficulty('medium');
      else if (difficulty === 'medium') setDifficulty('hard');
    } else {
      // Scale down or stay
      if (difficulty === 'hard') setDifficulty('medium');
      else if (difficulty === 'medium') setDifficulty('easy');
      
      // Track weak topic
      if (topic) setWrongTopics(prev => [...new Set([...prev, topic])]);
    }

    // Move to next question
    setCurrentIdx(prev => prev + 1);
  }, [difficulty]);

  const isFinished = currentIdx >= stageBank.length || currentIdx >= 10;

  return {
    currentQuestion,
    difficulty,
    wrongTopics,
    processAnswer,
    isFinished,
    progress: Math.min(currentIdx + 1, stageBank.length),
    total: Math.min(stageBank.length, 10)
  };
}
