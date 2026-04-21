/**
 * @fileoverview useQuiz hook — state machine for the knowledge quiz.
 * Manages question progression, answer selection, score calculation,
 * and phase transitions using useReducer.
 */

import { useReducer, useCallback } from 'react';
import { QUIZ_QUESTIONS } from '../utils/constants.js';

/**
 * @typedef {'playing'|'answered'|'results'} QuizPhase
 */

/**
 * @typedef {Object} QuizState
 * @property {number} currentIndex - Index of the current question (0-based)
 * @property {number} score - Number of correct answers so far
 * @property {number|null} selectedIndex - Index of the user's selected option, or null
 * @property {QuizPhase} phase - Current phase of the quiz
 */

// ── Actions ──────────────────────────────────────────────────────────────────
const SELECT_ANSWER = 'SELECT_ANSWER';
const NEXT_QUESTION = 'NEXT_QUESTION';
const RESET = 'RESET';

/** @type {QuizState} */
const initialState = {
  currentIndex: 0,
  score: 0,
  selectedIndex: null,
  phase: 'playing',
};

/**
 * Pure reducer function for quiz state transitions.
 *
 * @param {QuizState} state - Current state
 * @param {{ type: string, payload?: * }} action - Dispatched action
 * @returns {QuizState} Next state
 */
function quizReducer(state, action) {
  switch (action.type) {
    case SELECT_ANSWER: {
      if (state.phase !== 'playing') {
        return state;
      }

      const currentQuestion = QUIZ_QUESTIONS[state.currentIndex];
      const isCorrect = action.payload === currentQuestion.correctIndex;

      return {
        ...state,
        selectedIndex: action.payload,
        score: isCorrect ? state.score + 1 : state.score,
        phase: 'answered',
      };
    }

    case NEXT_QUESTION: {
      if (state.phase !== 'answered') {
        return state;
      }

      const isLastQuestion = state.currentIndex >= QUIZ_QUESTIONS.length - 1;

      if (isLastQuestion) {
        return {
          ...state,
          phase: 'results',
        };
      }

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        selectedIndex: null,
        phase: 'playing',
      };
    }

    case RESET: {
      return { ...initialState };
    }

    default:
      return state;
  }
}

/**
 * @typedef {Object} QuizHookReturn
 * @property {QuizState} state - Full quiz state
 * @property {QuizQuestion} currentQuestion - The current question object
 * @property {number} totalQuestions - Total number of questions
 * @property {Function} selectAnswer - Select an answer option by index
 * @property {Function} nextQuestion - Advance to the next question
 * @property {Function} resetQuiz - Reset to initial state
 */

/**
 * Custom hook managing the full quiz state machine.
 *
 * @returns {QuizHookReturn}
 */
function useQuiz() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  /**
   * Select an answer for the current question.
   * @param {number} optionIndex - Zero-based index of the selected option
   */
  const selectAnswer = useCallback((optionIndex) => {
    dispatch({ type: SELECT_ANSWER, payload: optionIndex });
  }, []);

  /**
   * Advance to the next question, or transition to results if finished.
   */
  const nextQuestion = useCallback(() => {
    dispatch({ type: NEXT_QUESTION });
  }, []);

  /**
   * Reset the quiz to its initial state.
   */
  const resetQuiz = useCallback(() => {
    dispatch({ type: RESET });
  }, []);

  return {
    state,
    currentQuestion: QUIZ_QUESTIONS[state.currentIndex],
    totalQuestions: QUIZ_QUESTIONS.length,
    selectAnswer,
    nextQuestion,
    resetQuiz,
  };
}

export default useQuiz;
