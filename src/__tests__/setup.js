/**
 * Global Jest test setup file.
 * Runs after the test framework is installed in the environment.
 * Patches jsdom APIs that are not natively implemented.
 */

// jsdom does not implement scrollIntoView — mock it globally
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// jsdom does not implement scrollTo — mock it globally
window.scrollTo = jest.fn();

// Mock IntersectionObserver (used by some UI libs)
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock gamification hooks globally
jest.mock('@/features/gamification/hooks/useXP.js', () => ({
  __esModule: true,
  default: () => ({
    xpState: { level: 1, xp: 0, title: 'New Voter', streak: 0, dailyXP: 0 },
    addXP: jest.fn(),
    notifications: [],
    removeNotification: jest.fn(),
  }),
}));

jest.mock('@/features/gamification', () => ({
  __esModule: true,
  useHearts: () => ({
    hearts: 5,
    loseHeart: jest.fn(),
  }),
  useXP: () => ({
    xpState: { level: 1, xp: 0, title: 'New Voter', streak: 0, dailyXP: 0 },
    addXP: jest.fn(),
    notifications: [],
    removeNotification: jest.fn(),
  }),
  HeartsBar: () => null,
  LeagueBadge: () => null,
  XPNotification: () => null,
  XPToast: () => null,
}));
