/**
 * @fileoverview NotFound component — 404 page for unknown routes.
 * Shown when the user navigates to a URL that doesn't exist.
 */

import React from 'react';

/**
 * 404 Not Found page with a styled error display and home navigation button.
 *
 * @returns {React.ReactElement}
 */
function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <main className="not-found" role="main" aria-labelledby="not-found-title">
      <div className="not-found-code" aria-hidden="true">404</div>
      <h1 className="text-title" id="not-found-title">Page Not Found</h1>
      <p className="text-body" style={{ color: 'var(--text-muted)', maxWidth: '360px', textAlign: 'center' }}>
        The page you&apos;re looking for doesn&apos;t exist. Head back to the election education hub.
      </p>
      <button
        className="btn btn-primary"
        onClick={handleGoHome}
        aria-label="Go back to the CivicMind AI home page"
        id="not-found-home-btn"
      >
        🏠 Back to Home
      </button>
    </main>
  );
}

export default NotFound;
