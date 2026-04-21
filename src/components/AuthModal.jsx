/**
 * @fileoverview AuthModal component — slide-up authentication modal.
 * Provides Google Sign-In, Email/Password auth, and guest continuation.
 * Uses useAuth hook internally for all auth operations.
 * Implements a keyboard focus trap when open.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { trapFocus } from '../utils/accessibility.js';
import useAuth from '../hooks/useAuth.js';

/**
 * @typedef {Object} AuthModalProps
 * @property {boolean} isOpen - Controls modal visibility
 * @property {Function} onClose - Callback to close the modal
 * @property {Function} onSuccess - Callback called after successful sign-in
 */

/**
 * Slide-up authentication modal with Google, Email, and Guest options.
 * Traps keyboard focus when open for full accessibility compliance.
 *
 * @param {AuthModalProps} props
 * @returns {React.ReactElement}
 */
function AuthModal({ isOpen, onClose, onSuccess }) {
  const modalRef = useRef(null);
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, error, clearError, isLoading } =
    useAuth();

  // Email form state
  const [emailMode, setEmailMode] = useState(null); // null | 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Trap focus within modal when open
  useEffect(() => {
    if (isOpen) {
      const cleanup = trapFocus(modalRef);
      return cleanup;
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clear error on open
  useEffect(() => {
    if (isOpen) {
      clearError();
      setEmailMode(null);
      setEmail('');
      setPassword('');
      setFormError('');
    }
  }, [isOpen, clearError]);

  const handleGoogle = useCallback(async () => {
    await signInWithGoogle();
    if (!error) {
      onSuccess?.();
      onClose();
    }
  }, [signInWithGoogle, error, onSuccess, onClose]);

  const handleEmailSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError('');

      if (!email || !password) {
        setFormError('Please fill in all fields.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }

      if (emailMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }

      if (!error) {
        onSuccess?.();
        onClose();
      }
    },
    [email, password, emailMode, signInWithEmail, signUpWithEmail, error, onSuccess, onClose]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`auth-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`auth-modal${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        id="auth-modal"
      >
        <div className="auth-modal-handle" aria-hidden="true" />

        <h2 className="auth-modal-title" id="auth-modal-title">
          Continue as CivicMind Member
        </h2>
        <p className="auth-modal-subtitle">
          Save your quiz scores and track your civic knowledge progress
        </p>

        {/* Error display */}
        {(error || formError) && (
          <p className="auth-error" role="alert">
            {formError || error}
          </p>
        )}

        {emailMode ? (
          /* ── Email form ── */
          <form className="auth-modal-actions" onSubmit={handleEmailSubmit} noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              required
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                width: '100%',
                outline: 'none',
              }}
              id="auth-email-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              aria-label="Password"
              autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
              required
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                width: '100%',
                outline: 'none',
              }}
              id="auth-password-input"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '13px' }}
              id="auth-submit-btn"
            >
              {isLoading ? 'Please wait…' : emailMode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setEmailMode(null)}
              style={{ width: '100%' }}
              id="auth-back-btn"
            >
              ← Back
            </button>
          </form>
        ) : (
          /* ── Option selection ── */
          <div className="auth-modal-actions">
            {/* Google Sign-In */}
            <button
              className="btn-google"
              onClick={handleGoogle}
              disabled={isLoading}
              aria-label="Continue with Google account"
              id="auth-google-btn"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                />
              </svg>
              {isLoading ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* Email options */}
            <button
              className="btn-email"
              onClick={() => setEmailMode('signin')}
              aria-label="Continue with email and password"
              id="auth-email-signin-btn"
            >
              📧 Sign In with Email
            </button>

            <button
              className="btn-email"
              onClick={() => setEmailMode('signup')}
              aria-label="Create a new account with email"
              id="auth-email-signup-btn"
              style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--gold)' }}
            >
              ✨ Create New Account
            </button>

            {/* Keep as guest */}
            <button
              className="btn btn-ghost"
              onClick={onClose}
              aria-label="Keep exploring as a guest"
              style={{ width: '100%' }}
              id="auth-guest-continue-btn"
            >
              👤 Keep Exploring as Guest
            </button>
          </div>
        )}

        <p className="auth-fine-print">
          By signing in, your guest progress will be merged into your account.
        </p>
      </div>
    </>
  );
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

AuthModal.defaultProps = {
  onSuccess: null,
};

export default AuthModal;
