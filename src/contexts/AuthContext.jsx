import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';
import logger from '../utils/logger.js';

export const AuthContext = createContext();

// ── Error Normalization ──────────────────────────────────────────────────────
const getFriendlyErrorMessage = (error) => {
  const code = error.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Incorrect email or password. Please try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Your password must be at least 6 characters long.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in was cancelled.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your connection.';
  }
  if (code === 'auth/credential-already-in-use') {
    return 'This account is already linked to another user.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until first onAuthStateChanged fires

  useEffect(() => {
    if (!auth) {
      setUser({ 
        uid: 'demo-user', 
        isAnonymous: true, 
        displayName: null,
        getIdToken: async () => 'demo-token'
      });
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoading(false);
        logger.info('Auth state: user present', { uid: firebaseUser.uid, isAnonymous: firebaseUser.isAnonymous });
      } else {
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

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      // Demo Mode
      logger.info('Demo Mode: Google sign-in simulated');
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUser({ 
        uid: 'demo-google-123', 
        isAnonymous: false, 
        displayName: 'Demo User', 
        email: 'demo@google.com',
        getIdToken: async () => 'demo-token'
      });
      return;
    }
    
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        // Attempt to merge guest account
        try {
          await linkWithPopup(auth.currentUser, googleProvider);
          logger.info('Guest account merged with Google successfully');
        } catch (linkError) {
          if (linkError.code === 'auth/credential-already-in-use') {
            // The Google account already exists. We can't merge, so we just sign in to the existing account.
            const credential = GoogleAuthProvider.credentialFromError(linkError);
            if (credential) {
              await signInWithCredential(auth, credential);
              logger.info('Signed in to existing Google account (guest progress dropped)');
            } else {
              throw linkError;
            }
          } else {
            throw linkError;
          }
        }
      } else {
        await signInWithPopup(auth, googleProvider);
        logger.info('Google sign-in successful');
      }
    } catch (err) {
      logger.error('Google sign-in failed', err);
      throw new Error(getFriendlyErrorMessage(err));
    }
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!auth) {
      // Demo Mode
      logger.info('Demo Mode: Email sign-in simulated');
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUser({ uid: 'demo-email-123', isAnonymous: false, displayName: email.split('@')[0], email });
      return;
    }
    try {
      // Just standard sign in for existing accounts
      await signInWithEmailAndPassword(auth, email, password);
      logger.info('Email sign-in successful');
    } catch (err) {
      logger.error('Email sign-in failed', err);
      throw new Error(getFriendlyErrorMessage(err));
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!auth) {
      // Demo Mode
      logger.info('Demo Mode: Email sign-up simulated');
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUser({ uid: 'demo-email-123', isAnonymous: false, displayName: email.split('@')[0], email });
      return;
    }
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        // Merge guest account
        const credential = EmailAuthProvider.credential(email, password);
        try {
          await linkWithCredential(auth.currentUser, credential);
          logger.info('Guest account merged with new Email successfully');
        } catch (linkError) {
          if (linkError.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists. Please sign in instead.');
          } else {
            throw linkError;
          }
        }
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        logger.info('Email sign-up successful');
      }
    } catch (err) {
      logger.error('Email sign-up failed', err);
      throw new Error(getFriendlyErrorMessage(err));
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) {
      // Demo Mode
      logger.info('Demo Mode: Sign-out simulated');
      await new Promise((resolve) => setTimeout(resolve, 400));
      setUser({ uid: 'demo-user', isAnonymous: true, displayName: null });
      return;
    }
    try {
      await firebaseSignOut(auth);
      logger.info('User signed out');
    } catch (err) {
      logger.error('Sign-out failed', err);
      throw new Error(getFriendlyErrorMessage(err));
    }
  }, []);

  const value = {
    user,
    isGuest: user?.isAnonymous === true,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
