/**
 * @fileoverview NavBar component — fixed left sidebar (desktop) / bottom tab bar (mobile).
 * Renders navigation items, logo, settings, and user avatar.
 * The avatar shows a guest gold dot indicator when the user is anonymous.
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { NAV_ITEMS } from '../utils/constants.js';

/**
 * @typedef {Object} NavBarProps
 * @property {string} activeTab - Currently active tab ID
 * @property {Function} onTabChange - Callback when a nav item is clicked
 * @property {import('firebase/auth').User|null} user - Current Firebase user
 * @property {boolean} isGuest - True if the user is anonymous
 * @property {Function} onAvatarClick - Callback to open the auth modal
 */

/**
 * Application sidebar navigation component.
 * On desktop: 72px fixed left sidebar.
 * On mobile: full-width bottom tab bar (controlled via CSS).
 *
 * @param {NavBarProps} props
 * @returns {React.ReactElement}
 */
function NavBar({ activeTab, onTabChange, user, isGuest, onAvatarClick }) {
  /**
   * Handle keyboard navigation for nav items.
   * Activates the item on Enter or Space.
   *
   * @param {React.KeyboardEvent} event
   * @param {string} tabId
   */
  const handleKeyDown = useCallback(
    (event, tabId) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onTabChange(tabId);
      }
    },
    [onTabChange]
  );

  /** Derive avatar initials from user display name or default to 'G' */
  const avatarInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : 'G';

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo mark */}
      <div className="sidebar-logo" aria-hidden="true" title="CivicMind AI">
        ⚖️
      </div>

      {/* Primary nav items */}
      <div className="sidebar-nav" role="list">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            role="listitem"
          >
            <button
              className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => onTabChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              aria-label={item.ariaLabel}
              aria-current={activeTab === item.id ? 'page' : undefined}
              title={item.ariaLabel}
              id={`nav-${item.id}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom: separator, settings, avatar */}
      <div className="sidebar-bottom">
        <div className="sidebar-separator" aria-hidden="true" />

        <button
          className="nav-item"
          aria-label="Settings"
          title="Settings"
          id="nav-settings"
        >
          <span className="nav-icon" aria-hidden="true">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>

        <button
          className="avatar-btn"
          onClick={onAvatarClick}
          aria-label={isGuest ? 'Guest user — click to save progress' : `Signed in as ${user?.displayName || user?.email || 'User'}`}
          title={isGuest ? 'Save Progress' : user?.displayName || 'Account'}
          id="nav-avatar"
        >
          {avatarInitial}
          {isGuest && (
            <span className="avatar-guest-dot" aria-hidden="true" />
          )}
        </button>
      </div>
    </nav>
  );
}

NavBar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  user: PropTypes.object,
  isGuest: PropTypes.bool.isRequired,
  onAvatarClick: PropTypes.func.isRequired,
};

NavBar.defaultProps = {
  user: null,
};

export default React.memo(NavBar);
