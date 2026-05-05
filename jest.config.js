/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/src/__tests__/setup.js',
  ],
  moduleNameMapper: {
    // Map firebase and logger to Jest-safe mocks (avoids import.meta.env parse errors)
    '^@/firebase(\\.js)?$': '<rootDir>/src/__tests__/__mocks__/firebaseMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
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
      branches: 15,
      functions: 15,
      lines: 20,
      statements: 20,
    },
  },
};

export default config;
