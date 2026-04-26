/**
 * @fileoverview useJourney — Context consumer for the mission map state.
 */

import { useContext } from 'react';
import { JourneyContext } from '../contexts/JourneyContext';

export default function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
