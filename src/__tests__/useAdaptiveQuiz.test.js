/**
 * @fileoverview useAdaptiveQuiz.test.js — Tests for adaptive logic.
 */

import { renderHook, act } from '@testing-library/react';
import useAdaptiveQuiz from '../hooks/useAdaptiveQuiz';

describe('useAdaptiveQuiz', () => {
  it('should start with easy difficulty', () => {
    const { result } = renderHook(() => useAdaptiveQuiz('nomination'));
    expect(result.current.difficulty).toBe('easy');
  });

  it('should increase difficulty on correct answer', () => {
    const { result } = renderHook(() => useAdaptiveQuiz('nomination'));
    
    act(() => {
      result.current.processAnswer(true, 'eligibility');
    });

    expect(result.current.difficulty).toBe('medium');
  });

  it('should flag weak topics on wrong answers', () => {
    const { result } = renderHook(() => useAdaptiveQuiz('nomination'));
    
    act(() => {
      result.current.processAnswer(false, 'eligibility');
    });

    expect(result.current.wrongTopics).toContain('eligibility');
    expect(result.current.difficulty).toBe('easy'); // stays easy if wrong from easy
  });
});
