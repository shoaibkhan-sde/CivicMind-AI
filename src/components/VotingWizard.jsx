/**
 * @fileoverview VotingWizard component — multi-step interactive voting guide.
 * Shows 5 steps of the voting process with progress bar, bullet content,
 * clickable dot navigation, and a celebratory completion screen.
 */

import React, { useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { WIZARD_STEPS, GA_EVENTS } from '../utils/constants.js';
import { focusElement, announceToScreenReader } from '../utils/accessibility.js';
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

// ── Wizard state machine ──────────────────────────────────────────────────────
const NEXT = 'NEXT';
const PREV = 'PREV';
const GO_TO = 'GO_TO';
const COMPLETE = 'COMPLETE';
const RESET = 'RESET';

const initialWizardState = {
  currentStep: 0, // 0-indexed
  completed: false,
};

function wizardReducer(state, action) {
  switch (action.type) {
    case NEXT: {
      if (state.currentStep >= WIZARD_STEPS.length - 1) {
        return { ...state, completed: true };
      }
      return { ...state, currentStep: state.currentStep + 1 };
    }
    case PREV: {
      if (state.currentStep <= 0) return state;
      return { ...state, currentStep: state.currentStep - 1 };
    }
    case GO_TO: {
      const idx = action.payload;
      if (idx < 0 || idx >= WIZARD_STEPS.length) return state;
      return { ...state, currentStep: idx };
    }
    case COMPLETE: {
      return { ...state, completed: true };
    }
    case RESET: {
      return { ...initialWizardState };
    }
    default:
      return state;
  }
}

/**
 * @typedef {Object} VotingWizardProps
 * @property {Function} onComplete - Callback fired when the wizard is completed
 */

/**
 * Interactive step-by-step voting guide wizard.
 * Manages its own step state via useReducer.
 * Moves keyboard focus to the step title on each step change.
 *
 * @param {VotingWizardProps} props
 * @returns {React.ReactElement}
 */
function VotingWizard({ onComplete }) {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const titleRef = useRef(null);

  const { currentStep, completed } = state;
  const step = WIZARD_STEPS[currentStep];
  const totalSteps = WIZARD_STEPS.length;

  // ── Progress bar width ─────────────────────────────────────────────────────
  const progressPercent = useMemo(
    () => Math.round(((currentStep) / totalSteps) * 100),
    [currentStep, totalSteps]
  );

  // ── Focus step title when step changes ────────────────────────────────────
  useEffect(() => {
    if (!completed) {
      focusElement(titleRef);
      announceToScreenReader(`Step ${currentStep + 1} of ${totalSteps}: ${WIZARD_STEPS[currentStep]?.title}`);
    }
  }, [currentStep, completed, totalSteps]);

  // ── GA tracking ───────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    const isLast = currentStep >= totalSteps - 1;
    trackEvent(GA_EVENTS.WIZARD_STEP_CHANGE, {
      step_number: currentStep + 1,
      direction: 'forward',
    });

    if (isLast) {
      dispatch({ type: COMPLETE });
      trackEvent(GA_EVENTS.WIZARD_COMPLETE, {});
      onComplete?.();
    } else {
      dispatch({ type: NEXT });
    }
  }, [currentStep, totalSteps, onComplete]);

  const handlePrev = useCallback(() => {
    trackEvent(GA_EVENTS.WIZARD_STEP_CHANGE, {
      step_number: currentStep + 1,
      direction: 'back',
    });
    dispatch({ type: PREV });
  }, [currentStep]);

  const handleDotClick = useCallback((idx) => {
    dispatch({ type: GO_TO, payload: idx });
  }, []);

  // ── Completion screen ──────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="wizard-container">
        <div className="wizard-complete" aria-live="assertive" role="status">
          <div className="wizard-checkmark-wrap" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polyline
                className="wizard-checkmark"
                points="6,17 13,24 26,9"
                stroke="var(--success)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <span className="wizard-complete-emoji" aria-hidden="true">🎉</span>

          <h2 className="text-hero" style={{ marginBottom: 12 }}>
            You&apos;re Ready to Vote!
          </h2>
          <p className="text-body" style={{ marginBottom: 32, color: 'var(--text-muted)' }}>
            You&apos;ve completed the voting guide. Now put your knowledge to the test!
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-ghost"
              onClick={() => dispatch({ type: RESET })}
              aria-label="Start the voting guide over from step 1"
              id="wizard-restart-btn"
            >
              🔄 Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step content ──────────────────────────────────────────────────────────
  return (
    <section className="wizard-container" aria-labelledby="wizard-heading">
      {/* Screen reader heading */}
      <h2 className="text-title" id="wizard-heading" style={{ marginBottom: 20 }}>
        🗳️ Voting Step-by-Step Guide
      </h2>

      {/* Animated progress bar */}
      <div
        className="wizard-progress-track"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
      >
        <div
          className="wizard-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step badge */}
      <p className="wizard-step-badge">
        Step {currentStep + 1} of {totalSteps}
      </p>

      {/* Step content area — aria-live for screen reader updates */}
      <div
        className="wizard-step-content"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Step ${currentStep + 1}: ${step.title}`}
      >
        {/* Step icon */}
        <div className="wizard-icon-wrap" aria-hidden="true">
          {step.icon}
        </div>

        {/* Step title — receives focus on step change */}
        <h3
          ref={titleRef}
          className="wizard-step-title"
          tabIndex={-1}
          id={`wizard-step-title-${currentStep}`}
        >
          {step.title}
        </h3>

        {/* Bullet list */}
        <ul className="wizard-bullets" aria-label={`Details for step: ${step.title}`}>
          {step.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <nav className="wizard-nav" aria-label="Wizard step navigation">
        <button
          className="btn btn-ghost"
          onClick={handlePrev}
          disabled={currentStep === 0}
          aria-label="Go to previous step"
          aria-disabled={currentStep === 0}
          id="wizard-prev-btn"
        >
          ← Previous
        </button>

        {/* Step dots */}
        <div className="wizard-dots" role="list" aria-label="Step indicators">
          {WIZARD_STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`wizard-dot${i < currentStep ? ' completed' : ''}${i === currentStep ? ' active' : ''}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
              aria-current={i === currentStep ? 'step' : undefined}
              id={`wizard-dot-${i + 1}`}
              role="listitem"
            />
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          aria-label={
            currentStep === totalSteps - 1
              ? 'Complete the voting guide'
              : 'Go to next step'
          }
          id="wizard-next-btn"
        >
          {currentStep === totalSteps - 1 ? '🎉 Complete' : 'Next →'}
        </button>
      </nav>
    </section>
  );
}

VotingWizard.propTypes = {
  onComplete: PropTypes.func,
};

VotingWizard.defaultProps = {
  onComplete: null,
};

export default VotingWizard;
