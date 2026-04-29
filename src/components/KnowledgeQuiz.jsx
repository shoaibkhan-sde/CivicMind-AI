import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import useQuiz from '../hooks/useQuiz.js';
import useFirebase from '../hooks/useFirebase.js';
import useXP from '../hooks/useXP.js';
import { useHearts } from '../contexts/HeartsContext.jsx';
import { GA_EVENTS } from '../utils/constants.js';
import { announceToScreenReader } from '../utils/accessibility.js';
import logger from '../utils/logger.js';
import { auth } from '../firebase.js';
import { ArrowLeft, X, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import SAGEOwl from './SAGEOwl.jsx';
import LessonComplete from './LessonComplete.jsx';
import HeartsBar from './HeartsBar.jsx';

function trackEvent(eventName, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    logger.error('GA4 tracking error', err);
  }
}

/**
 * KnowledgeQuiz — Duolingo-style fullscreen lesson mode.
 * - Hearts-based lives: lose a heart after 3 wrong attempts on the same question.
 * - SAGE owl reacts to correct / wrong answers.
 * - LessonComplete celebration overlay after finishing all questions.
 * - Previous button for review navigation.
 */
function KnowledgeQuiz({ onComplete = null, onReset = null }) {
  const {
    state, currentQuestion, totalQuestions,
    selectAnswer, nextQuestion, prevQuestion, resetQuiz
  } = useQuiz();
  const { saveScore, leaderboard, leaderboardLoading } = useFirebase(auth?.currentUser?.uid);
  const { addXP } = useXP();
  const { hearts, loseHeart } = useHearts();

  const [allWrongAttempts, setAllWrongAttempts] = useState({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [owlState, setOwlState] = useState('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  // Bottom panel: null | 'correct' | 'wrong'
  const [bottomPanel, setBottomPanel] = useState(null);

  const hasTrackedStart = useRef(false);
  const hasAwardedXP = useRef(false);
  const owlTimer = useRef(null);
  const wrongChainRef = useRef(0); // consecutive wrong presses this question

  const { currentIndex, score, phase } = state;
  const percentage = useMemo(() => Math.round((score / totalQuestions) * 100), [score, totalQuestions]);

  const isCorrectFound = phase === 'answered';
  const wrongAttempts = allWrongAttempts[currentIndex] || [];
  const hasWrongAttempt = wrongAttempts.length > 0;

  // Track quiz start
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent(GA_EVENTS.QUIZ_START, {});
      hasTrackedStart.current = true;
    }
  }, []);

  // Results: show LessonComplete overlay before results screen
  useEffect(() => {
    if (phase === 'results' && !hasAwardedXP.current) {
      const xp = score * 20;
      saveScore(score, totalQuestions);
      if (xp > 0) addXP(xp);
      setEarnedXP(xp);
      trackEvent(GA_EVENTS.QUIZ_COMPLETE, { score, total: totalQuestions, percentage });
      onComplete?.();
      hasAwardedXP.current = true;
      setOwlState('celebrating');
      setShowCelebration(true);
    }
  }, [phase, score, totalQuestions, percentage, saveScore, onComplete, addXP]);

  // Reset wrong chain when question changes
  useEffect(() => {
    wrongChainRef.current = 0;
    setBottomPanel(null);
  }, [currentIndex]);

  const setOwlFor = useCallback((state, durationMs = 2000) => {
    setOwlState(state);
    clearTimeout(owlTimer.current);
    owlTimer.current = setTimeout(() => setOwlState('idle'), durationMs);
  }, []);

  const handleAnswer = useCallback((idx) => {
    if (isCorrectFound) return;
    if (wrongAttempts.includes(idx)) return;

    if (idx === currentQuestion.correctIndex) {
      setIsReviewMode(false);
      selectAnswer(idx);
      setBottomPanel('correct');
      setOwlFor('celebrating', 2500);
      wrongChainRef.current = 0;
      announceToScreenReader('Correct! ' + currentQuestion.explanation, 'assertive');
    } else {
      setAllWrongAttempts(prev => ({
        ...prev,
        [currentIndex]: [...(prev[currentIndex] || []), idx],
      }));
      setBottomPanel('wrong');
      setOwlFor('sad', 1800);
      wrongChainRef.current += 1;
      // Lose a heart every 3 wrong attempts on the same question
      if (wrongChainRef.current % 3 === 0) {
        loseHeart();
      }
    }
  }, [isCorrectFound, wrongAttempts, currentQuestion, currentIndex, selectAnswer, setOwlFor, loseHeart]);

  const handleNext = useCallback(() => {
    setIsReviewMode(false);
    setBottomPanel(null);
    nextQuestion();
  }, [nextQuestion]);

  const handlePrev = useCallback(() => {
    setIsReviewMode(true);
    setBottomPanel(null);
    prevQuestion();
  }, [prevQuestion]);

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else {
      resetQuiz();
      setAllWrongAttempts({});
      setIsReviewMode(false);
      setBottomPanel(null);
      setShowCelebration(false);
      setOwlState('idle');
      hasTrackedStart.current = false;
      hasAwardedXP.current = false;
    }
  }, [resetQuiz, onReset]);

  // ── Results / Celebration ──────────────────────────────────────────────────
  if (showCelebration && phase === 'results') {
    return (
      <LessonComplete
        score={score}
        total={totalQuestions}
        earnedXP={earnedXP}
        onContinue={() => setShowCelebration(false)}
        onRetry={handleReset}
      />
    );
  }

  if (phase === 'results' && !showCelebration) {
    // Classic results screen after dismissing LessonComplete
    return (
      <div className="card text-center" style={{ padding: '48px', maxWidth: '600px', margin: '40px auto' }}>
        <SAGEOwl state={percentage >= 70 ? 'celebrating' : 'sad'} size={64} />
        <div style={{ marginTop: '24px', marginBottom: '8px', fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
          {percentage >= 80 ? '🏆 Civic Champion!' : percentage >= 50 ? '👍 Good Job!' : '📚 Keep Learning!'}
        </div>
        <p className="text-body" style={{ marginBottom: '32px' }}>
          You scored {score} out of {totalQuestions} · {earnedXP} XP earned
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={handleReset}>
            <RotateCcw size={16} /> Retake Quiz
          </button>
          {onReset && (
            <button className="btn btn-primary" onClick={handleReset}>Back to Hub</button>
          )}
        </div>
      </div>
    );
  }

  // ── Fullscreen Lesson Shell ────────────────────────────────────────────────
  return (
    <div className="lesson-shell">
      {/* ── Lesson Top Bar (Duolingo style) ── */}
      <div className="lesson-topbar">
        {/* Left: Previous / Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentIndex > 0 ? (
            <button className="lesson-nav-btn" onClick={handlePrev} title="Previous question">
              <ArrowLeft size={18} />
            </button>
          ) : (
            <button className="lesson-nav-btn" onClick={handleReset} title="Exit quiz">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Center: progress bar */}
        <div className="lesson-progress-wrap">
          <div className="lesson-progress-track">
            <div
              className="lesson-progress-fill"
              style={{ width: `${((currentIndex + (isCorrectFound ? 1 : 0)) / totalQuestions) * 100}%` }}
            />
          </div>
          {isReviewMode && (
            <span className="lesson-review-badge">🔍 Review</span>
          )}
        </div>

        {/* Right: hearts */}
        <HeartsBar />
      </div>

      {/* ── Question Body ── */}
      <div className="lesson-body">
        {/* SAGE owl */}
        <div className="lesson-owl-area">
          <SAGEOwl state={owlState} size={48} />
          {owlState === 'thinking' && (
            <div className="owl-speech-bubble">Hmm, think carefully...</div>
          )}
        </div>

        {/* Question */}
        <h2 className="lesson-question">{currentQuestion?.question}</h2>

        {/* Wrong-attempt hint */}
        {hasWrongAttempt && !isCorrectFound && (
          <div className="lesson-hint-banner">
            💡 Keep trying — you've eliminated {wrongAttempts.length} wrong option{wrongAttempts.length > 1 ? 's' : ''}!
          </div>
        )}

        {/* Options */}
        <div className="lesson-options">
          {currentQuestion?.options.map((option, idx) => {
            const isWrong = wrongAttempts.includes(idx);
            const isCorrectOpt = idx === currentQuestion.correctIndex;
            const isDisabled = isCorrectFound || isWrong;

            let cls = 'lesson-option';
            if (isCorrectFound && isCorrectOpt) cls += ' correct';
            else if (isWrong) cls += ' wrong';

            return (
              <button
                key={idx}
                className={cls}
                onClick={() => handleAnswer(idx)}
                disabled={isDisabled}
              >
                <span className="lesson-option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="lesson-option-text">{option}</span>
                {isCorrectFound && isCorrectOpt && <CheckCircle size={20} className="lesson-option-icon correct-icon" />}
                {isWrong && <XCircle size={20} className="lesson-option-icon wrong-icon" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Duolingo Bottom Panel ── */}
      {bottomPanel && (
        <div className={`lesson-bottom-panel ${bottomPanel}`}>
          <div className="bottom-panel-content">
            {bottomPanel === 'correct' ? (
              <>
                <div className="bottom-panel-icon">✅</div>
                <div>
                  <div className="bottom-panel-title">Brilliant!</div>
                  <p className="bottom-panel-text">{currentQuestion?.explanation}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bottom-panel-icon">❌</div>
                <div>
                  <div className="bottom-panel-title">Not quite!</div>
                  <p className="bottom-panel-text">
                    That's not right. You have {wrongAttempts.length} wrong attempt{wrongAttempts.length > 1 ? 's' : ''}. Keep trying!
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            className={`lesson-check-btn ${bottomPanel}`}
            onClick={bottomPanel === 'correct' ? handleNext : () => setBottomPanel(null)}
          >
            {bottomPanel === 'correct'
              ? (currentIndex < totalQuestions - 1 ? 'CONTINUE' : 'FINISH')
              : 'GOT IT'}
          </button>
        </div>
      )}

      {/* If no bottom panel and correct found — show continue directly */}
      {!bottomPanel && isCorrectFound && (
        <div className="lesson-bottom-panel correct">
          <div className="bottom-panel-content">
            <div className="bottom-panel-icon">✅</div>
            <div>
              <div className="bottom-panel-title">Brilliant!</div>
              <p className="bottom-panel-text">{currentQuestion?.explanation}</p>
            </div>
          </div>
          <button className="lesson-check-btn correct" onClick={handleNext}>
            {currentIndex < totalQuestions - 1 ? 'CONTINUE' : 'FINISH'}
          </button>
        </div>
      )}

      {/* CHECK button (shown only when playing and no option selected yet) */}
      {!bottomPanel && !isCorrectFound && (
        <div className="lesson-bottom-neutral">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Question {currentIndex + 1} of {totalQuestions}
          </div>
        </div>
      )}
    </div>
  );
}

KnowledgeQuiz.propTypes = {
  onComplete: PropTypes.func,
  onReset: PropTypes.func,
};

export default KnowledgeQuiz;
