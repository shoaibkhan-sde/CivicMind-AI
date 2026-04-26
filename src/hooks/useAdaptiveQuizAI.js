import { useState, useCallback } from 'react';
import useAuth from './useAuth';
import useJourney from './useJourney';
import useXP from './useXP';

const API_URL = '/api';

/**
 * Hook for managing AI-generated quiz questions.
 */
export default function useAdaptiveQuizAI() {
  const { user } = useAuth();
  const { currentStage } = useJourney();
  const { xpState } = useXP();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`${API_URL}/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          stage: currentStage.id,
          difficulty: xpState.level > 3 ? 'medium' : 'easy',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate AI question');
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Quiz AI Error:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, [user, currentStage.id, xpState.level]);

  return { fetchQuestion, isLoading, error };
}
