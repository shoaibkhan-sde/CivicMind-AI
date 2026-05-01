/**
 * @fileoverview useGeminiChat hook — manages AI chat session with the Flask backend.
 * Handles message history, loading state, error handling, rate limit
 * countdown, and retry capability.
 */

import { useState, useCallback, useRef, useContext } from 'react';
import { sanitizeInput } from '../utils/sanitize.js';
import logger from '../utils/logger.js';
import { auth } from '../firebase.js';
import { SettingsContext } from '../contexts/SettingsContext.jsx';

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique message ID
 * @property {'user'|'assistant'} role - Who sent the message
 * @property {string} content - Message text
 * @property {number} timestamp - Unix timestamp (ms)
 */

/**
 * @typedef {Object} GeminiChatState
 * @property {ChatMessage[]} messages - Full conversation history
 * @property {boolean} isLoading - True while waiting for AI response
 * @property {string|null} error - Error message if the last request failed
 * @property {number} retryCountdown - Seconds until rate limit resets (0 = not rate limited)
 * @property {Function} sendMessage - Send a new user message
 * @property {Function} retryLast - Retry the last failed message
 * @property {Function} clearError - Reset the error state
 */

/**
 * Custom hook for managing the Gemini AI chat interface.
 *
 * @param {string} [context='election_education'] - Context hint sent to the backend
 * @returns {GeminiChatState}
 */
function useGeminiChat(context = 'election_education') {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const lastMessageRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const { settings } = useContext(SettingsContext) || {};

  /**
   * Starts a countdown timer for rate limit recovery.
   * @param {number} seconds - Seconds to count down
   */
  const startCountdown = useCallback((seconds) => {
    setRetryCountdown(seconds);
    clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Sends a message to the Flask /api/chat endpoint.
   * Sanitizes input before sending and handles all error states.
   *
   * @param {string} rawText - Raw user input text
   * @returns {Promise<void>}
   */
  const sendMessage = useCallback(
    async (rawText) => {
      // Validate and sanitize input
      let sanitized;
      try {
        sanitized = sanitizeInput(rawText);
      } catch (err) {
        setError(err.message);
        return;
      }

      setError(null);
      setIsLoading(true);

      // Append user message immediately for responsiveness
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: sanitized,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      lastMessageRef.current = sanitized;

      try {
        let token = null;
        if (auth && auth.currentUser) {
          try {
            token = await auth.currentUser.getIdToken();
          } catch (tokenErr) {
            logger.warn('Failed to get auth token for chat request', tokenErr);
          }
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const payload = { 
          message: sanitized, 
          history: messages.map(m => ({ role: m.role, content: m.content })),
          context,
          aiConfig: settings?.ai || { style: 'standard', difficulty: 'medium' },
          appContext: {
            userLevel: settings?.learningData?.userLevel || 1,
            currentStage: context,
            weakTopics: settings?.learningData?.weakTopics || []
          }
        };


        const response = await fetch('/api/chat/', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          startCountdown(retryAfter);
          throw new Error(`Rate limit reached. Please wait ${retryAfter} seconds.`);
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        logger.info('Chat: received reply', { length: data.reply?.length });
      } catch (err) {
        logger.error('Chat: API request failed', err);
        setError(err.message || 'Could not reach AI. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    },
    [context, startCountdown]
  );

  /**
   * Retries the last failed message.
   * @returns {void}
   */
  const retryLast = useCallback(() => {
    if (lastMessageRef.current) {
      // Remove last user message before resending to avoid duplication
      setMessages((prev) =>
        prev.filter((m) => m.id !== `user-${lastMessageRef.current}`)
      );
      sendMessage(lastMessageRef.current);
    }
  }, [sendMessage]);

  /** Reset error state */
  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    isLoading,
    error,
    retryCountdown,
    sendMessage,
    retryLast,
    clearError,
  };
}

export default useGeminiChat;
