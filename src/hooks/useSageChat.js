/**
 * @fileoverview useSageChat — Upgraded AI chat hook for Sage the Mentor.
 * Injects user context (stage, level, weak topics) into every request.
 */

import { useState, useCallback, useEffect } from 'react';
import useAuth from './useAuth';
import useXP from './useXP';
import useJourney from './useJourney';
import logger from '../utils/logger';

const API_URL = '/api';

/**
 * Manages conversation with Sage the Mentor.
 * @returns {Object} { messages, sendMessage, isLoading, error }
 */
export default function useSageChat(scope = 'mentor') {
  const { user } = useAuth();
  const { xpState } = useXP();
  const { currentStage } = useJourney();
  const storageKey = `sage_chat_history_${scope}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync to localStorage on every change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const token = await user?.getIdToken();
      
      // Construct the full Sage context object
      const sageContext = {
        currentStage: currentStage.id,
        userLevel: xpState.level,
        xp: xpState.xp,
        weakTopics: [], 
        lastWrongAnswer: '',
        questionsAsked: messages.length / 2,
      };

      // ── Gemini Cache Check ──
      const cacheKey = btoa(JSON.stringify({ content, sageContext })).slice(0, 32);
      const cached = sessionStorage.getItem(`sage_cache_${cacheKey}`);
      if (cached) {
        setMessages(prev => [...prev, JSON.parse(cached)]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          appContext: sageContext,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get Sage\'s response');
      }

      const data = await response.json();
      const sageReply = { 
        role: 'assistant', 
        content: data.reply, 
        timestamp: data.timestamp 
      };
      
      // Cache response
      sessionStorage.setItem(`sage_cache_${cacheKey}`, JSON.stringify(sageReply));
      
      setMessages(prev => [...prev, sageReply]);
      logger.info('Sage reply received', { stage: currentStage.id });

    } catch (err) {
      logger.error('Sage Chat Error', err);
      setError(err.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oops! My owl-senses are tingling. I'm having trouble connecting right now. 🦉",
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [user, xpState, currentStage, messages.length]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { messages, sendMessage, isLoading, error, clearChat };
}
