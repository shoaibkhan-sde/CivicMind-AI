/**
 * @fileoverview HeartsContext — Duolingo-style lives system.
 * - Max 5 hearts. Lose 1 per wrong answer chain (≥3 wrong on same question).
 * - Auto-refill: 1 heart every 4 hours.
 * - Persisted in localStorage; synced to Firebase when logged in.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database as db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { MAX_HEARTS, HEART_REFILL_MS } from '../utils/leagues';

/**
 * Context for managing the heart-based life system.
 */
const HeartsContext = createContext();

const LS_HEARTS = 'civic_hearts';
const LS_REFILL_AT = 'civic_hearts_refill_at';

function loadLocal() {
  return {
    hearts: parseInt(localStorage.getItem(LS_HEARTS) ?? String(MAX_HEARTS)),
    nextRefillAt: parseInt(localStorage.getItem(LS_REFILL_AT) ?? '0'),
  };
}

export function HeartsProvider({ children }) {
  const { user } = useAuth();

  const [hearts, setHearts] = useState(() => loadLocal().hearts);
  const [nextRefillAt, setNextRefillAt] = useState(() => loadLocal().nextRefillAt);
  const intervalRef = useRef(null);

  // Sync from Firebase on login
  useEffect(() => {
    if (!user || !db) return;
    const r = ref(db, `users/${user.uid}/hearts`);
    return onValue(r, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setHearts(Math.min(data.hearts ?? MAX_HEARTS, MAX_HEARTS));
        setNextRefillAt(data.nextRefillAt ?? 0);
        localStorage.setItem(LS_HEARTS, String(data.hearts ?? MAX_HEARTS));
        localStorage.setItem(LS_REFILL_AT, String(data.nextRefillAt ?? 0));
      } else {
        // No data in Firebase (deleted), reset to max hearts
        setHearts(MAX_HEARTS);
        setNextRefillAt(0);
        localStorage.setItem(LS_HEARTS, String(MAX_HEARTS));
        localStorage.setItem(LS_REFILL_AT, '0');
      }
    });
  }, [user]);

  // Auto-refill ticker — check every minute
  useEffect(() => {
    function tick() {
      const now = Date.now();
      setHearts(prev => {
        if (prev >= MAX_HEARTS) return prev;
        setNextRefillAt(nra => {
          // Fix for migrating from 4 hours to 5 minutes:
          // If the scheduled refill is further in the future than the new constant, adjust it.
          let currentNra = nra;
          if (currentNra - now > HEART_REFILL_MS) {
            currentNra = now + HEART_REFILL_MS;
            localStorage.setItem(LS_REFILL_AT, String(currentNra));
            // Note: we don't spam firebase here, we'll wait for the next real state change to sync.
          }

          if (now >= currentNra) {
            const newHearts = Math.min(prev + 1, MAX_HEARTS);
            const newRefill = newHearts < MAX_HEARTS ? now + HEART_REFILL_MS : 0;
            localStorage.setItem(LS_HEARTS, String(newHearts));
            localStorage.setItem(LS_REFILL_AT, String(newRefill));
            if (user && db) {
              update(ref(db, `users/${user.uid}/hearts`), { hearts: newHearts, nextRefillAt: newRefill });
            }
            return newRefill;
          }
          return currentNra;
        });
        return prev;
      });
    }
    tick(); // run immediately on mount
    intervalRef.current = setInterval(tick, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  const persist = useCallback(async (newHearts, newRefill) => {
    localStorage.setItem(LS_HEARTS, String(newHearts));
    localStorage.setItem(LS_REFILL_AT, String(newRefill));
    if (user && db) {
      return await update(ref(db, `users/${user.uid}/hearts`), { hearts: newHearts, nextRefillAt: newRefill });
    }
    return Promise.resolve();
  }, [user]);

  const loseHeart = useCallback(() => {
    setHearts(prev => {
      if (prev <= 0) return 0;
      const next = prev - 1;
      const refill = next < MAX_HEARTS && nextRefillAt === 0 ? Date.now() + HEART_REFILL_MS : nextRefillAt;
      setNextRefillAt(refill);
      persist(next, refill);
      return next;
    });
  }, [nextRefillAt, persist]);

  const refillAllHearts = useCallback(async () => {
    setHearts(MAX_HEARTS);
    setNextRefillAt(0);
    return await persist(MAX_HEARTS, 0);
  }, [persist]);

  // Seconds until next heart
  const secondsToRefill = hearts < MAX_HEARTS && nextRefillAt > 0
    ? Math.max(0, Math.ceil((nextRefillAt - Date.now()) / 1000))
    : 0;

  return (
    <HeartsContext.Provider value={{ hearts, maxHearts: MAX_HEARTS, loseHeart, refillAllHearts, secondsToRefill }}>
      {children}
    </HeartsContext.Provider>
  );
}

/**
 * Custom hook to consume the HeartsContext.
 * @returns {Object} { hearts, maxHearts, loseHeart, refillAllHearts, secondsToRefill }
 */
export const useHearts = () => useContext(HeartsContext);
