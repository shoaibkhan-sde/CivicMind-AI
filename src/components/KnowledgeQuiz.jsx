/**
 * @fileoverview KnowledgeQuiz component — 10-question multiple choice quiz.
 * Uses useQuiz hook for state machine and useFirebase for score persistence.
 * Features correct/incorrect animations, leaderboard, and SVG score ring.
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import useQuiz from '../hooks/useQuiz.js';
import useFirebase from '../hooks/useFirebase.js';
import { QUIZ_QUESTIONS, GA_EVENTS } from '../utils/constants.js';
import { announceToScreenReader } from '../utils/accessibility.js';
import logger from '../utils/logger.js';

/** GA4 event tracker */
function trackEvent(eventName, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    logger.error('GA4 tracking error', err);
  }
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

/**
 * Compute the result message based on a percentage score.
 * @param {number} percentage - Score from 0-100
 * @returns {string}
 */
function getResultMessage(percentage) {
  if (percentage >= 80) return '🏆 Civic Champion!';
  if (percentage >= 50) return '👍 Good Job!';
  return '📚 Keep Learning!';
}

/**
 * SVG circular progress ring for the results screen.
 * @param {{ percentage: number }} props
 */
function ScoreRing({ percentage }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - (percentage / 100) * circumference;

  return (
    <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden="true">
      {/* Background ring */}
      <circle
        cx="65"
        cy="65"
        r={radius}
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth="10"
      />
      {/* Score ring */}
      <circle
        cx="65"
        cy="65"
        r={radius}
        fill="none"
        stroke={percentage >= 80 ? 'var(--gold)' : percentage >= 50 ? 'var(--blue-light)' : 'var(--text-muted)'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDash}
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      {/* Score text */}
      <text
        x="65"
        y="60"
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize="22"
        fontWeight="700"
        fontFamily="var(--font-display)"
      >
        {percentage}%
      </text>
      <text
        x="65"
        y="78"
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="11"
        fontFamily="var(--font-body)"
      >
        Score
      </text>
    </svg>
  );
}

ScoreRing.propTypes = {
  percentage: PropTypes.number.isRequired,
};

/**
 * @typedef {Object} KnowledgeQuizProps
 * @property {Function} [onComplete] - Callback fired when the quiz finishes
 */

/**
 * KnowledgeQuiz — 10-question multiple choice quiz with score tracking and leaderboard.
 *
 * @param {KnowledgeQuizProps} props
 * @returns {React.ReactElement}
 */
function KnowledgeQuiz({ onComplete }) {
  const { state, currentQuestion, totalQuestions, selectAnswer, nextQuestion, resetQuiz } =
    useQuiz();
  const { saveScore, leaderboard, leaderboardLoading } = useFirebase(null);

  const feedbackRef = useRef(null);
  const hasTrackedStart = useRef(false);

  // Track quiz start once
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent(GA_EVENTS.QUIZ_START, {});
      hasTrackedStart.current = true;
    }
  }, []);

  const { currentIndex, score, selectedIndex, phase } = state;
  const percentage = useMemo(
    () => Math.round((score / totalQuestions) * 100),
    [score, totalQuestions]
  );

  const starCount = useMemo(() => {
    if (percentage >= 80) return 3;
    if (percentage >= 50) return 2;
    if (percentage >= 20) return 1;
    return 0;
  }, [percentage]);

  // Save score and call onComplete when results phase is reached
  useEffect(() => {
    if (phase === 'results') {
      saveScore(score, totalQuestions);
      trackEvent(GA_EVENTS.QUIZ_COMPLETE, {
        score,
        total: totalQuestions,
        percentage,
      });
      onComplete?.();
    }
  }, [phase, score, totalQuestions, percentage, saveScore, onComplete]);

  // Announce result after answering
  useEffect(() => {
    if (phase === 'answered' && currentQuestion) {
      const isCorrect = selectedIndex === currentQuestion.correctIndex;
      announceToScreenReader(
        isCorrect ? 'Correct! ' + currentQuestion.explanation : 'Incorrect. ' + currentQuestion.explanation,
        'assertive'
      );
    }
  }, [phase, selectedIndex, currentQuestion]);

  const handleSelectAnswer = useCallback(
    (optionIndex) => {
      if (phase !== 'playing') return;
      const isCorrect = optionIndex === currentQuestion.correctIndex;
      selectAnswer(optionIndex);

      trackEvent(GA_EVENTS.QUIZ_ANSWER, {
        question_id: String(currentQuestion.id),
        correct: isCorrect,
      });
    },
    [phase, currentQuestion, selectAnswer]
  );

  const handleReset = useCallback(() => {
    resetQuiz();
    hasTrackedStart.current = false;
    trackEvent(GA_EVENTS.QUIZ_START, {});
  }, [resetQuiz]);

  // ── Results screen ─────────────────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <section className="quiz-container" aria-labelledby="quiz-results-heading">
        <div className="quiz-results">
          <h2 className="text-title" id="quiz-results-heading" style={{ marginBottom: 24 }}>
            Quiz Complete!
          </h2>

          <div className="quiz-score-ring-wrap" aria-label={`Your score: ${score} out of ${totalQuestions}, ${percentage}%`}>
            <ScoreRing percentage={percentage} />
          </div>

          {/* Stars */}
          <div className="quiz-stars" aria-label={`${starCount} out of 3 stars`}>
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`quiz-star${star <= starCount ? ' earned' : ''}`}
                aria-hidden="true"
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Result message — aria-live for screen reader */}
          <p
            className="quiz-result-message"
            aria-live="assertive"
            role="status"
          >
            {getResultMessage(percentage)}
          </p>
          <p className="quiz-result-sub">
            You scored {score} out of {totalQuestions}
          </p>

          {/* Leaderboard */}
          <div className="leaderboard" aria-labelledby="leaderboard-heading">
            <div className="leaderboard-header" id="leaderboard-heading">
              🏅 Top Scores
            </div>
            {leaderboardLoading ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div className="skeleton" style={{ height: 14, width: '60%', margin: '0 auto' }} />
              </div>
            ) : leaderboard.length === 0 ? (
              <p style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No scores yet — you&apos;re the first! 🎉
              </p>
            ) : (
              leaderboard.map((entry, i) => (
                <div key={entry.id} className="leaderboard-row">
                  <span className="leaderboard-rank" aria-hidden="true">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="text-small">{entry.displayName}</span>
                  <span className="leaderboard-score">
                    {entry.score}/{entry.total}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleReset}
            aria-label="Retake the quiz from the beginning"
            id="quiz-retake-btn"
          >
            🔄 Retake Quiz
          </button>
        </div>
      </section>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);

  return (
    <section className="quiz-container" aria-labelledby={`quiz-question-${currentIndex}`}>
      {/* Header with progress */}
      <div className="quiz-header">
        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
        >
          <div
            className="quiz-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="quiz-question-count" aria-hidden="true">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <h2
        className="quiz-question-text"
        id={`quiz-question-${currentIndex}`}
        role="heading"
        aria-level={2}
      >
        {currentQuestion.question}
      </h2>

      {/* Options */}
      <div
        className="quiz-options"
        role="group"
        aria-labelledby={`quiz-question-${currentIndex}`}
      >
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = phase === 'answered' && i === currentQuestion.correctIndex;
          const isWrong = phase === 'answered' && isSelected && i !== currentQuestion.correctIndex;

          let optionClass = 'quiz-option';
          if (phase === 'answered') {
            optionClass += ' answered';
            if (isCorrect) optionClass += ' correct';
            else if (isWrong) optionClass += ' incorrect';
            else if (isSelected) optionClass += ' selected';
          } else if (isSelected) {
            optionClass += ' selected';
          }

          return (
            <button
              key={i}
              className={optionClass}
              onClick={() => handleSelectAnswer(i)}
              disabled={phase === 'answered'}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={phase === 'answered' ? 'quiz-explanation' : undefined}
              id={`quiz-option-${currentIndex}-${i}`}
            >
              <span className="quiz-option-label" aria-hidden="true">
                {isCorrect ? '✓' : isWrong ? '✗' : OPTION_LABELS[i]}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation after answering */}
      {phase === 'answered' && (
        <div
          className="quiz-explanation"
          id="quiz-explanation"
          ref={feedbackRef}
          aria-live="assertive"
          role="status"
        >
          💡 {currentQuestion.explanation}
        </div>
      )}

      {/* Next button */}
      {phase === 'answered' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={nextQuestion}
            aria-label={
              currentIndex === totalQuestions - 1
                ? 'See your results'
                : 'Go to next question'
            }
            id="quiz-next-btn"
          >
            {currentIndex === totalQuestions - 1 ? 'See Results 🏆' : 'Next Question →'}
          </button>
        </div>
      )}
    </section>
  );
}

KnowledgeQuiz.propTypes = {
  onComplete: PropTypes.func,
};

KnowledgeQuiz.defaultProps = {
  onComplete: null,
};

export default KnowledgeQuiz;
