import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import useQuiz from '../hooks/useQuiz.js';
import useFirebase from '../hooks/useFirebase.js';
import useXP from '../hooks/useXP.js';
import { GA_EVENTS } from '../utils/constants.js';
import { announceToScreenReader } from '../utils/accessibility.js';
import logger from '../utils/logger.js';
import { SettingsContext } from '../contexts/SettingsContext.jsx';
import { auth } from '../firebase.js';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';

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

/**
 * KnowledgeQuiz — 10-question multiple choice quiz with score tracking and leaderboard.
 *
 * @param {{ onComplete?: Function, onReset?: Function }} props
 */
function KnowledgeQuiz({ onComplete = null, onReset = null }) {
  const { state, currentQuestion, totalQuestions, selectAnswer, nextQuestion, resetQuiz } = useQuiz();
  const { saveScore, leaderboard, leaderboardLoading } = useFirebase(auth?.currentUser?.uid);
  const { addXP } = useXP();
  const { settings } = React.useContext(SettingsContext) || {};

  const [dynamicExplanation, setDynamicExplanation] = React.useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = React.useState(false);
  const [consecutiveWrong, setConsecutiveWrong] = React.useState(0);
  const [showConfusionPrompt, setShowConfusionPrompt] = React.useState(false);

  const feedbackRef = useRef(null);
  const hasTrackedStart = useRef(false);
  const hasAwardedXP = useRef(false);

  // Track quiz start once
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent(GA_EVENTS.QUIZ_START, {});
      hasTrackedStart.current = true;
    }
  }, []);

  const { currentIndex, score, selectedIndex, phase } = state;
  const percentage = useMemo(() => Math.round((score / totalQuestions) * 100), [score, totalQuestions]);

  // Save score and call onComplete when results phase is reached
  useEffect(() => {
    if (phase === 'results' && !hasAwardedXP.current) {
      saveScore(score, totalQuestions);
      // Award 20 XP per correct answer in standard quiz
      const earnedXP = score * 20;
      if (earnedXP > 0) addXP(earnedXP);
      
      trackEvent(GA_EVENTS.QUIZ_COMPLETE, { score, total: totalQuestions, percentage });
      onComplete?.();
      hasAwardedXP.current = true;
    }
  }, [phase, score, totalQuestions, percentage, saveScore, onComplete, addXP]);

  // Announce result after answering
  useEffect(() => {
    if (phase === 'answered' && currentQuestion) {
      const isCorrect = isCorrectFound;
      announceToScreenReader(
        isCorrect ? 'Correct! ' + currentQuestion.explanation : 'Incorrect. ' + currentQuestion.explanation,
        'assertive'
      );
    }
  }, [phase, isCorrectFound, currentQuestion]);

  const handleAnswer = (idx) => {
    if (isCorrectFound || selectedOptions.includes(idx)) return;
    
    setSelectedOptions(prev => [...prev, idx]);
    
    if (idx === currentQuestion.correctIndex) {
      setIsCorrectFound(true);
      setPhase('answered');
      if (selectedOptions.length === 0) {
        setScore(s => s + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      nextQuestion();
      setSelectedOptions([]);
      setIsCorrectFound(false);
      setPhase('playing');
    } else {
      setPhase('results');
    }
  };

  const handleReset = useCallback(() => {
    if (onReset) onReset();
    else {
      resetQuiz();
      hasTrackedStart.current = false;
      hasAwardedXP.current = false;
      trackEvent(GA_EVENTS.QUIZ_START, {});
    }
  }, [resetQuiz, onReset]);

  // ── Results screen ─────────────────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <div className="card text-center" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="result-ring" style={{ width: '150px', height: '150px', margin: '0 auto 32px', position: 'relative' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-default)" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="var(--gold)" 
              strokeWidth="8" 
              strokeLinecap="round"
              style={{ strokeDasharray: `${(score / totalQuestions) * 283} 283`, transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {percentage}%
          </div>
        </div>
        
        <h3 className="text-title" style={{ marginBottom: '12px' }}>
          {percentage >= 80 ? '🏆 Civic Champion!' : percentage >= 50 ? '👍 Good Job!' : '📚 Keep Learning!'}
        </h3>
        <p className="text-body" style={{ marginBottom: '32px' }}>
          You scored {score} out of {totalQuestions}. Earned {score * 20} XP!
        </p>

        {/* Leaderboard */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: '16px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} className="icon-gold" /> Global Top Scores
          </h4>
          {leaderboardLoading ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: 14, width: '60%', margin: '0 auto' }} />
            </div>
          ) : leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No scores yet — you're the first! 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((entry, i) => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ width: '20px', textAlign: 'center', fontWeight: '700', color: i < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{entry.displayName}</span>
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{entry.score}/{entry.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => { resetQuiz(); hasTrackedStart.current = false; hasAwardedXP.current = false; }}>
            <RotateCcw size={16} /> Retake Quiz
          </button>
          {onReset && (
            <button className="btn btn-primary" onClick={handleReset}>
              Back to Hub
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: 'var(--gold)', background: 'var(--gold-subtle)', padding: '4px 12px', borderRadius: '99px' }}>
            Knowledge Check
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Question {currentIndex + 1} of {totalQuestions}</div>
          <div style={{ width: '100px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--blue)', width: `${((currentIndex + 1) / totalQuestions) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '32px', lineHeight: '1.4' }}>
        {currentQuestion.question}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOptions.includes(idx);
          const isCorrectOption = idx === currentQuestion.correctIndex;
          
          let bgClass = 'var(--bg-elevated)';
          let borderClass = 'var(--border-default)';
          let textClass = 'var(--text-main)';
          
          const isDisabled = isCorrectFound || isSelected;

          if (isSelected) {
            if (isCorrectOption) {
              bgClass = 'var(--success-bg)';
              borderClass = 'var(--success)';
              textClass = 'var(--success)';
            } else if (!isCorrectFound) {
              bgClass = 'rgba(239, 68, 68, 0.1)';
              borderClass = 'var(--error)';
              textClass = 'var(--error)';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isDisabled}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px',
                background: bgClass, border: `1px solid ${borderClass}`, borderRadius: '16px',
                color: textClass, fontSize: '16px', fontWeight: '500', textAlign: 'left',
                cursor: isDisabled ? 'default' : 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: (!isDisabled && isSelected) ? 'translateX(8px)' : 'none'
              }}
              onMouseOver={(e) => { if(!isDisabled) { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
              onMouseOut={(e) => { if(!isDisabled && !isSelected) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
            >
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span style={{ flex: 1 }}>{option}</span>
              {isSelected && isCorrectOption && <CheckCircle size={20} className="icon-green" />}
              {isSelected && !isCorrectOption && !isCorrectFound && <AlertTriangle size={20} className="icon-orange" />}
            </button>
          );
        })}
      </div>

      {isCorrectFound && (
        <div className="card" style={{ marginTop: '32px', position: 'relative', borderColor: 'var(--success)', animation: 'slide-up 0.4s ease' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '24px', width: '30px', height: '30px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💡</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginTop: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              {selectedOptions.length === 1 
                ? <span><strong style={{ color: 'var(--success)' }}>Brilliant!</strong> {currentQuestion.explanation}</span>
                : <span><strong style={{ color: 'var(--warning)' }}>You got it!</strong> {currentQuestion.explanation}</span>
              }
            </p>
            <button className="btn btn-primary" onClick={handleNext} style={{ flexShrink: 0, padding: '12px 20px' }}>
              {currentIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'} <ArrowRight size={16} />
            </button>
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
