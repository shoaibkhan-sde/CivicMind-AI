/**
 * @fileoverview useJourney.test.js — Tests for mission map logic.
 */

import { renderHook, act } from '@testing-library/react';
import useJourney from '../hooks/useJourney';
import { JOURNEY_STAGES } from '../utils/constants';

// Mock Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({ val: () => ({ announcement: true }) });
    return jest.fn(); // Unsubscribe
  }),
  update: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({ user: { uid: 'test-uid' } }),
}));

describe('useJourney', () => {
  it('should initialize with completed stages from Firebase', () => {
    const { result } = renderHook(() => useJourney());
    expect(result.current.completedStages).toContain('announcement');
  });

  it('should identify the correct current stage', () => {
    const { result } = renderHook(() => useJourney());
    // Since announcement is completed, registration should be next
    expect(result.current.currentStage.id).toBe('registration');
  });

  it('should correctly identify locked stages', () => {
    const { result } = renderHook(() => useJourney());
    // nomination is locked because registration is not completed
    expect(result.current.isLocked('nomination')).toBe(true);
    // announcement is never locked
    expect(result.current.isLocked('announcement')).toBe(false);
  });
});
