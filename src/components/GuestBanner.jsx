/**
 * @fileoverview GuestBanner component — persistent banner for guest users.
 * Shown below the topbar to inform guests their progress won't be saved
 * and nudge them toward creating an account.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} GuestBannerProps
 * @property {Function} onDismiss - Callback to hide the banner
 * @property {Function} onSignUp - Callback to open the auth modal
 */

/**
 * Persistent top banner encouraging guests to create an account.
 * Animates in with a slide-down effect and can be dismissed.
 *
 * @param {GuestBannerProps} props
 * @returns {React.ReactElement}
 */
function GuestBanner({ onDismiss, onSignUp }) {
  return (
    <div
      className="guest-banner"
      role="alert"
      aria-label="Guest session notification"
      id="guest-banner"
    >
      <p className="guest-banner-text">
        👋 <strong>Exploring as Guest</strong> — your progress won&apos;t be saved
      </p>
      <div className="guest-banner-actions">
        <button
          className="btn btn-ghost"
          onClick={onDismiss}
          aria-label="Dismiss this banner and continue as guest"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          id="guest-banner-dismiss"
        >
          Maybe Later
        </button>
        <button
          className="btn btn-gold"
          onClick={onSignUp}
          aria-label="Create a free account to save your progress"
          style={{ fontSize: '12px', padding: '6px 14px' }}
          id="guest-banner-signup"
        >
          ✨ Create Free Account
        </button>
      </div>
    </div>
  );
}

GuestBanner.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  onSignUp: PropTypes.func.isRequired,
};

export default React.memo(GuestBanner);
