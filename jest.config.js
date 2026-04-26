/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/src/__tests__/setup.js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Map firebase and logger to Jest-safe mocks (avoids import.meta.env parse errors)
    '<rootDir>/src/firebase(\\.js)?$': '<rootDir>/src/__tests__/__mocks__/firebaseMock.js',
    '.*/src/firebase(\\.js)?$': '<rootDir>/src/__tests__/__mocks__/firebaseMock.js',
    '.*/src/utils/logger(\\.js)?$': '<rootDir>/src/__tests__/__mocks__/logger.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg|ico)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/src/__tests__/**/*.(test|spec).(js|jsx)'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/firebase.js',
    '!src/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

export default config;
