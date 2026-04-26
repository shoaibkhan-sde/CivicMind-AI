/**
 * @fileoverview NavBar component — fixed left sidebar (desktop) / bottom tab bar (mobile).
 * Renders navigation items, logo, settings, and user avatar.
 * The avatar shows a guest gold dot indicator when the user is anonymous.
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { NAV_ITEMS, TABS } from '../utils/constants.js';
import { 
  Map as MapIcon, 
  Users, 
  Bot, 
  GraduationCap, 
  Settings, 
  User as UserIcon,
  Compass
} from 'lucide-react';

const ICON_MAP = {
  [TABS.JOURNEY]: <MapIcon size={20} />,
  [TABS.SIMULATE]: <Users size={20} />,
  [TABS.MENTOR]: <Bot size={20} />,
  [TABS.QUIZ]: <GraduationCap size={20} />,
};

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
function NavBar({ activeTab, onTabChange, user = null, isGuest, onAvatarClick }) {
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

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo mark */}
      <div className="sidebar-logo" aria-hidden="true" title="CivicMind AI">
        <Compass size={32} className="logo-icon-premium" />
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
              aria-label={item.label}
              aria-current={activeTab === item.id ? 'page' : undefined}
              title={item.label}
              id={`nav-${item.id}`}
            >
              <span className="nav-icon" aria-hidden="true">{ICON_MAP[item.id]}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom: separator, settings, avatar */}
      <div className="sidebar-bottom">
        <div className="sidebar-separator" aria-hidden="true" />

        <button
          className={`nav-item${activeTab === TABS.SETTINGS ? ' active' : ''}`}
          onClick={() => onTabChange(TABS.SETTINGS)}
          aria-label="Settings"
          title="Settings"
          id="nav-settings"
        >
          <span className="nav-icon" aria-hidden="true"><Settings size={20} /></span>
          <span className="nav-label">Settings</span>
        </button>

        <button
          className="avatar-btn"
          onClick={onAvatarClick}
          aria-label={user ? 'User Profile' : 'Sign In'}
          title={user ? user.displayName || user.email || 'Account' : 'Sign In'}
          id="nav-avatar"
        >
          {(user && user.email) 
            ? user.email[0].toUpperCase() 
            : (user && user.displayName) 
              ? user.displayName[0].toUpperCase() 
              : <UserIcon size={18} />}
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
  isGuest: PropTypes.bool,
  onAvatarClick: PropTypes.func.isRequired,
};

export default React.memo(NavBar);
