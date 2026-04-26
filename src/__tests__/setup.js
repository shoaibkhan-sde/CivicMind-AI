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
