/**
 * @fileoverview Application entry point for CivicMind AI.
 * Mounts the React app using React 18 createRoot API.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from './contexts/AuthContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import { ProgressionProvider } from './contexts/ProgressionContext.jsx';
import { JourneyProvider } from './contexts/JourneyContext.jsx';
import { HeartsProvider } from './contexts/HeartsContext.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains <div id="root"></div>');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <ProgressionProvider>
          <HeartsProvider>
            <JourneyProvider>
              <App />
            </JourneyProvider>
          </HeartsProvider>
        </ProgressionProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
