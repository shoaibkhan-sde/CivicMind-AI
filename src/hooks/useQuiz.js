/**
 * @fileoverview useQuiz hook — state machine for the knowledge quiz.
 * Manages question progression, answer selection, score calculation,
 * phase transitions, and backwards navigation using useReducer.
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
 * @property {Object.<number, {selectedIndex: number}>} answeredQuestions - Per-question answer history
 */

// ── Actions ──────────────────────────────────────────────────────────────────
const SELECT_ANSWER = 'SELECT_ANSWER';
const NEXT_QUESTION = 'NEXT_QUESTION';
const PREVIOUS_QUESTION = 'PREVIOUS_QUESTION';
const RESET = 'RESET';

/** @type {QuizState} */
const initialState = {
  currentIndex: 0,
  score: 0,
  selectedIndex: null,
  phase: 'playing',
  answeredQuestions: {}, // { [questionIndex]: { selectedIndex: number } }
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
        // Persist this question's answer so we can restore it when navigating back
        answeredQuestions: {
          ...state.answeredQuestions,
          [state.currentIndex]: { selectedIndex: action.payload },
        },
      };
    }

    case NEXT_QUESTION: {
      if (state.phase !== 'answered') {
        return state;
      }

      const isLastQuestion = state.currentIndex >= QUIZ_QUESTIONS.length - 1;

      if (isLastQuestion) {
        return { ...state, phase: 'results' };
      }

      const nextIndex = state.currentIndex + 1;
      const nextAnswer = state.answeredQuestions[nextIndex];

      return {
        ...state,
        currentIndex: nextIndex,
        // Restore previous answer if user is revisiting an already-answered question
        selectedIndex: nextAnswer?.selectedIndex ?? null,
        phase: nextAnswer ? 'answered' : 'playing',
      };
    }

    case PREVIOUS_QUESTION: {
      if (state.currentIndex === 0) {
        return state; // Already at first question
      }

      const prevIndex = state.currentIndex - 1;
      const prevAnswer = state.answeredQuestions[prevIndex];

      return {
        ...state,
        currentIndex: prevIndex,
        selectedIndex: prevAnswer?.selectedIndex ?? null,
        phase: prevAnswer ? 'answered' : 'playing',
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
 * @property {Function} prevQuestion - Go back to the previous question
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
   * Go back to the previous question for review.
   */
  const prevQuestion = useCallback(() => {
    dispatch({ type: PREVIOUS_QUESTION });
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
    prevQuestion,
    resetQuiz,
  };
}

export default useQuiz;
