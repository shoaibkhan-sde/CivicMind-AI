/**
 * @fileoverview useFirebase hook — Firebase Realtime Database operations.
 * Handles quiz score saving and leaderboard reading.
 * Requires an authenticated user (anonymous or named) from useAuth.
 */

import { useState, useCallback, useEffect } from 'react';
import { ref, push, query, orderByChild, limitToLast, get, update } from 'firebase/database';
import { database } from '../firebase.js';
import logger from '../utils/logger.js';

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} id - Firebase push key
 * @property {number} score - Points scored
 * @property {number} total - Total possible points
 * @property {number} timestamp - Unix timestamp (ms)
 * @property {string} displayName - Anonymous "Player #XXXX" label
 */

/**
 * @typedef {Object} FirebaseState
 * @property {Function} saveScore - Save quiz result to Realtime DB
 * @property {LeaderboardEntry[]} leaderboard - Top 5 scores
 * @property {boolean} leaderboardLoading - True while fetching leaderboard
 * @property {boolean} scoreSaving - True while saving a score
 */

/**
 * Custom hook for Firebase Realtime Database operations.
 *
 * @param {string|null} uid - Current user's Firebase UID
 * @returns {FirebaseState}
 */
function useFirebase(uid) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [scoreSaving, setScoreSaving] = useState(false);

  /**
   * Fetches the top 5 quiz scores from Firebase Realtime Database.
   * @returns {Promise<void>}
   */
  const fetchLeaderboard = useCallback(async () => {
    if (!database) {
      setLeaderboardLoading(false);
      return;
    }
    setLeaderboardLoading(true);
    try {
      const scoresRef = ref(database, 'quiz_scores');
      const topScoresQuery = query(scoresRef, orderByChild('score'), limitToLast(5));
      const snapshot = await get(topScoresQuery);

      if (snapshot.exists()) {
        const entries = [];
        snapshot.forEach((child) => {
          entries.push({
            id: child.key,
            ...child.val(),
            displayName: `Player #${child.key.slice(-4).toUpperCase()}`,
          });
        });
        // Sort descending by score
        entries.sort((a, b) => b.score - a.score);
        setLeaderboard(entries);
        logger.info('Leaderboard fetched', { count: entries.length });
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      logger.error('Failed to fetch leaderboard', err);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  /**
   * Saves a quiz result to Firebase Realtime Database.
   * Requires a valid uid. Triggers a leaderboard refresh on success.
   *
   * @param {number} score - Points the user scored
   * @param {number} total - Total possible points (e.g. 10)
   * @returns {Promise<void>}
   */
  const saveScore = useCallback(
    async (score, total) => {
      if (!uid || !database) {
        logger.warn('saveScore skipped — uid or database not available');
        return;
      }

      setScoreSaving(true);
      try {
        const scoresRef = ref(database, 'quiz_scores');
        await push(scoresRef, {
          score,
          total,
          uid,
          timestamp: Date.now(),
        });
        logger.info('Score saved', { score, total });
        await fetchLeaderboard();
      } catch (err) {
        logger.error('Failed to save score', err);
      } finally {
        setScoreSaving(false);
      }
    },
    [uid, fetchLeaderboard]
  );

  return {
    saveScore,
    leaderboard,
    leaderboardLoading,
    scoreSaving,
    /**
     * Saves or updates the user's mission progress.
     * @param {string} stageId
     * @param {boolean} completed
     */
    saveJourneyProgress: async (stageId, completed = true) => {
      if (!uid || !database) return;
      const journeyRef = ref(database, `users/${uid}/journey`);
      await update(journeyRef, { [stageId]: completed });
      logger.info('Journey progress saved', { stageId });
    },
    /**
     * Updates user profile attributes (XP, Level, etc).
     * @param {Object} updates
     */
    saveProfileUpdates: async (updates) => {
      if (!uid || !database) return;
      const profileRef = ref(database, `users/${uid}/profile`);
      await update(profileRef, updates);
      logger.info('Profile updated', updates);
    }
  };
}

export default useFirebase;
