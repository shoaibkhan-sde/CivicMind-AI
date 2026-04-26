/**
 * @fileoverview App.jsx — CivicMind AI Adventure Shell.
 * Character-driven navigation and state orchestration.
 */

import React, { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import NavBar from './components/NavBar.jsx';
import AuthModal from './components/AuthModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import XPNotification from './components/XPNotification.jsx';
import XPToast from './components/XPToast.jsx';
import useAuth from './hooks/useAuth.js';
import useXP from './hooks/useXP.js';
import { TABS } from './utils/constants.js';
import { Zap, Flame, CloudUpload } from 'lucide-react';

// ── Lazy-loaded adventure views ──────────────────────────────────────────────
const JourneyMap = lazy(() => import('./components/JourneyMap.jsx'));
const CandidateSimulator = lazy(() => import('./components/CandidateSimulator.jsx'));
const SageMentor = lazy(() => import('./components/SageMentor.jsx'));
const AdaptiveQuiz = lazy(() => import('./components/AdaptiveQuiz.jsx'));
const SettingsView = lazy(() => import('./components/SettingsView.jsx'));

/**
 * Suspense fallback.
 */
function TabFallback() {
  return (
    <div className="suspense-fallback" aria-label="Loading adventure...">
      <div className="spinner" role="status" />
    </div>
  );
}

/**
 * Root application component.
 */
function App() {
  const [activeTab, setActiveTab] = useState(TABS.JOURNEY);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { xpState, notifications, removeNotification } = useXP();
  const { user, isGuest } = useAuth();
  const [lastLevel, setLastLevel] = useState(xpState.level);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // ── Level Up & Victory Detection ──
  useEffect(() => {
    if (xpState.level > lastLevel) {
      setIsVictory(false);
      setShowLevelUp(true);
      setLastLevel(xpState.level);
    }
  }, [xpState.level, lastLevel]);

  useEffect(() => {
    const handleVictory = () => {
      setIsVictory(true);
      setShowLevelUp(true);
    };
    window.addEventListener('civic_victory', handleVictory);
    return () => window.removeEventListener('civic_victory', handleVictory);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case TABS.JOURNEY:
        return <JourneyMap />;
      case TABS.SIMULATE:
        return <CandidateSimulator />;
      case TABS.MENTOR:
        return <SageMentor />;
      case TABS.QUIZ:
        return <AdaptiveQuiz />;
      case TABS.SETTINGS:
        return <SettingsView />;
      default:
        return <JourneyMap />;
    }
  };

  return (
    <div className="app-shell">
      {/* Main Sidebar */}
      <NavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        isGuest={isGuest}
        onAvatarClick={() => setAuthModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="main" id="main-content">
        <header className="header-top">
          <div className="header-title">
            <h1>Civic Adventure</h1>
            <div className="level-status">
              <p>{xpState.title} · Level {xpState.level}</p>
              <div className="level-progress-track">
                <div 
                  className="level-progress-fill" 
                  style={{ width: `${xpState.progressToNext}%` }}
                />
              </div>
            </div>
          </div>
          <div className="header-badges">
            <div className="badge xp" title="Total XP">
              <Zap size={14} className="icon-gold" />
              <span>{xpState.xp} XP</span>
            </div>
            <div className={`badge streak ${xpState.isTodayActive ? 'active' : ''}`} title="Daily Streak">
              <Flame size={14} className={xpState.isTodayActive ? 'icon-orange' : 'icon-muted'} />
              <span>{xpState.streak}</span>
            </div>
            {isGuest && (
              <button className="badge save" onClick={() => setAuthModalOpen(true)}>
                <CloudUpload size={14} />
                Save
              </button>
            )}
          </div>
        </header>

        <Suspense fallback={<TabFallback />}>
          <ErrorBoundary>
            <div className="page-content">
              {renderTab()}
            </div>
          </ErrorBoundary>
        </Suspense>
      </main>

      {/* Overlays */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {showLevelUp && (
        <XPNotification 
          newLevel={xpState.level} 
          newTitle={xpState.title} 
          isVictory={isVictory}
          onClose={() => {
            setShowLevelUp(false);
            setIsVictory(false);
          }} 
        />
      )}

      {/* XP Gain Toasts */}
      <div className="xp-toast-container">
        {notifications.map(note => (
          <XPToast 
            key={note.id} 
            amount={note.amount} 
            onComplete={() => removeNotification(note.id)} 
          />
        ))}
      </div>

    </div>
  );
}

export default App;
