/**
 * @fileoverview useAuth hook — single source of truth for authentication state.
 * Manages Firebase Anonymous Auth, Google Sign-In, Email/Password auth,
 * and sign-out. Any component needing auth state uses this hook.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';
import logger from '../utils/logger.js';

/**
 * @typedef {Object} AuthState
 * @property {import('firebase/auth').User|null} user - Current Firebase user
 * @property {boolean} isGuest - True if the user is anonymous
 * @property {boolean} isLoading - True while auth state is being determined
 * @property {string|null} error - Auth error message, if any
 * @property {Function} signInWithGoogle - Initiate Google OAuth sign-in
 * @property {Function} signInWithEmail - Sign in with email and password
 * @property {Function} signUpWithEmail - Create a new email account
 * @property {Function} signOut - Sign the user out
 * @property {Function} clearError - Reset the error state
 */

/**
 * Custom hook that manages the full Firebase authentication lifecycle.
 * On mount, it listens for auth state changes and signs in anonymously
 * if no user is detected.
 *
 * @returns {AuthState}
 */
function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to auth state changes (only if Firebase is configured)
  useEffect(() => {
    if (!auth) {
      // Demo mode — no Firebase configured
      setUser({ uid: 'demo-user', isAnonymous: true, displayName: null });
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoading(false);
        logger.info('Auth state: user present', { uid: firebaseUser.uid, isAnonymous: firebaseUser.isAnonymous });
      } else {
        // No user — sign in anonymously so Firebase quota and DB writes work
        try {
          await signInAnonymously(auth);
          logger.info('Signed in anonymously');
        } catch (err) {
          logger.error('Anonymous sign-in failed', err);
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Google using a popup window.
   * @returns {Promise<void>}
   */
  const signInWithGoogle = useCallback(async () => {
    if (!auth) { setError('Firebase not configured. Please add your .env file.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      logger.info('Google sign-in successful');
    } catch (err) {
      logger.error('Google sign-in failed', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  const signInWithEmail = useCallback(async (email, password) => {
    if (!auth) { setError('Firebase not configured. Please add your .env file.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      logger.info('Email sign-in successful');
    } catch (err) {
      logger.error('Email sign-in failed', err);
      setError(err.message || 'Sign-in failed. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new account with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  const signUpWithEmail = useCallback(async (email, password) => {
    if (!auth) { setError('Firebase not configured. Please add your .env file.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      logger.info('Email sign-up successful');
    } catch (err) {
      logger.error('Email sign-up failed', err);
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign the current user out.
   * @returns {Promise<void>}
   */
  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      logger.info('User signed out');
    } catch (err) {
      logger.error('Sign-out failed', err);
      setError(err.message || 'Sign-out failed.');
    }
  }, []);

  /** Clear the current error state */
  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    isGuest: user?.isAnonymous === true,
    isLoading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
  };
}

export default useAuth;
