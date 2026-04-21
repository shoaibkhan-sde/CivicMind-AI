/**
 * @fileoverview App.jsx — CivicMind AI application shell.
 * Manages top-level tab routing, auth state, guest banner,
 * and auth modal via useReducer. Uses React.lazy + Suspense for
 * code-split tab components and ErrorBoundary per tab.
 */

import React, { lazy, Suspense, useReducer, useCallback, useEffect } from 'react';
import NavBar from './components/NavBar.jsx';
import TopBar from './components/TopBar.jsx';
import GuestBanner from './components/GuestBanner.jsx';
import AuthModal from './components/AuthModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotFound from './components/NotFound.jsx';
import useAuth from './hooks/useAuth.js';
import { TABS, TAB_META, WIZARD_STEPS, GA_EVENTS } from './utils/constants.js';
import logger from './utils/logger.js';

// ── Lazy-loaded tab components (code splitting) ──────────────────────────────
const ElectionTimeline = lazy(() => import('./components/ElectionTimeline.jsx'));
const VotingWizard = lazy(() => import('./components/VotingWizard.jsx'));
const AIChat = lazy(() => import('./components/AIChat.jsx'));
const KnowledgeQuiz = lazy(() => import('./components/KnowledgeQuiz.jsx'));

// ── GA4 tracker ──────────────────────────────────────────────────────────────
function trackEvent(eventName, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    logger.error('GA4 tracking error', err);
  }
}

// ── App state machine ────────────────────────────────────────────────────────
const SET_TAB = 'SET_TAB';
const OPEN_AUTH_MODAL = 'OPEN_AUTH_MODAL';
const CLOSE_AUTH_MODAL = 'CLOSE_AUTH_MODAL';
const DISMISS_BANNER = 'DISMISS_BANNER';
const SET_WIZARD_STEP = 'SET_WIZARD_STEP';

const initialAppState = {
  activeTab: TABS.TIMELINE,
  isAuthModalOpen: false,
  isGuestBannerVisible: true,
  wizardStep: 0,
};

function appReducer(state, action) {
  switch (action.type) {
    case SET_TAB:
      return { ...state, activeTab: action.payload };
    case OPEN_AUTH_MODAL:
      return { ...state, isAuthModalOpen: true };
    case CLOSE_AUTH_MODAL:
      return { ...state, isAuthModalOpen: false };
    case DISMISS_BANNER:
      return { ...state, isGuestBannerVisible: false };
    case SET_WIZARD_STEP:
      return { ...state, wizardStep: action.payload };
    default:
      return state;
  }
}

/**
 * Suspense fallback shown while tab components are loading.
 */
function TabFallback() {
  return (
    <div className="suspense-fallback" aria-label="Loading content">
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}

/**
 * Root application component.
 * Orchestrates the app shell, auth state, and tab routing.
 *
 * @returns {React.ReactElement}
 */
function App() {
  const [appState, dispatch] = useReducer(appReducer, initialAppState);
  const { user, isGuest, isLoading: authLoading } = useAuth();

  const { activeTab, isAuthModalOpen, isGuestBannerVisible, wizardStep } = appState;

  // Hide guest banner if user is signed in
  useEffect(() => {
    if (!isGuest && !authLoading) {
      dispatch({ type: DISMISS_BANNER });
    }
  }, [isGuest, authLoading]);

  // Track page_view on tab change
  useEffect(() => {
    trackEvent(GA_EVENTS.PAGE_VIEW, { tab_name: activeTab });
    logger.info('Tab changed', { activeTab });
  }, [activeTab]);

  const handleTabChange = useCallback((tabId) => {
    dispatch({ type: SET_TAB, payload: tabId });
  }, []);

  const handleOpenAuth = useCallback(() => {
    dispatch({ type: OPEN_AUTH_MODAL });
  }, []);

  const handleCloseAuth = useCallback(() => {
    dispatch({ type: CLOSE_AUTH_MODAL });
  }, []);

  const handleDismissBanner = useCallback(() => {
    dispatch({ type: DISMISS_BANNER });
  }, []);

  const handleWizardComplete = useCallback(() => {
    dispatch({ type: SET_WIZARD_STEP, payload: WIZARD_STEPS.length });
  }, []);

  const handleWizardStepChange = useCallback((step) => {
    dispatch({ type: SET_WIZARD_STEP, payload: step });
  }, []);

  // ── Render active tab content ──────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case TABS.TIMELINE:
        return (
          <ErrorBoundary>
            <Suspense fallback={<TabFallback />}>
              <ElectionTimeline />
            </Suspense>
          </ErrorBoundary>
        );

      case TABS.WIZARD:
        return (
          <ErrorBoundary>
            <Suspense fallback={<TabFallback />}>
              <VotingWizard
                onComplete={handleWizardComplete}
              />
            </Suspense>
          </ErrorBoundary>
        );

      case TABS.CHAT:
        return (
          <ErrorBoundary>
            <Suspense fallback={<TabFallback />}>
              <AIChat context="election_education" />
            </Suspense>
          </ErrorBoundary>
        );

      case TABS.QUIZ:
        return (
          <ErrorBoundary>
            <Suspense fallback={<TabFallback />}>
              <KnowledgeQuiz />
            </Suspense>
          </ErrorBoundary>
        );

      default:
        return <NotFound />;
    }
  };

  return (
    <div className="app-shell">
      {/* ── Left sidebar / mobile bottom bar ── */}
      <NavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        isGuest={isGuest}
        onAvatarClick={handleOpenAuth}
      />

      {/* ── Main content area ── */}
      <div className="main" id="main-content">
        {/* Top bar */}
        <TopBar
          activeTab={activeTab}
          wizardStep={wizardStep}
          wizardTotal={WIZARD_STEPS.length}
          isGuest={isGuest}
          onSaveProgress={handleOpenAuth}
        />

        {/* Guest banner — shown below topbar when user is a guest */}
        {isGuest && isGuestBannerVisible && (
          <GuestBanner
            onDismiss={handleDismissBanner}
            onSignUp={handleOpenAuth}
          />
        )}

        {/* Scrollable page content */}
        <main
          className="page-content"
          id="page-content"
          aria-labelledby="page-title"
          tabIndex={-1}
        >
          {renderTab()}
        </main>
      </div>

      {/* ── Auth modal — rendered at root to overlay everything ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        onSuccess={handleCloseAuth}
      />
    </div>
  );
}

export default App;
