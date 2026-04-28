/**
 * @fileoverview System-wide constants for CivicMind AI.
 */

export * from './journey_config.js';
export * from './quiz_bank.js';

export const TABS = {
  JOURNEY: 'journey',
  SIMULATE: 'simulate',
  MENTOR: 'mentor',
  QUIZ: 'quiz',
  SETTINGS: 'settings',
};

export const GA_EVENTS = {
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  QUIZ_COMPLETE: 'quiz_complete',
  LEVEL_UP: 'level_up',
};

export const CHAT_MAX_CHARS = 500;
export const CHAT_WARN_CHARS = 400;

export const XP_LEVELS = [
  { min: 0, title: 'New Voter', level: 1 },
  { min: 100, title: 'Aware Citizen', level: 2 },
  { min: 250, title: 'Active Voter', level: 3 },
  { min: 500, title: 'Civic Leader', level: 4 },
];

export const NAV_ITEMS = [
  { id: TABS.JOURNEY, icon: '🗺️', label: 'Journey' },
  { id: TABS.SIMULATE, icon: '🎭', label: 'Simulate' },
  { id: TABS.MENTOR, icon: '🤖', label: 'Mentor' },
  { id: TABS.QUIZ, icon: '🧠', label: 'Quiz' },
];
