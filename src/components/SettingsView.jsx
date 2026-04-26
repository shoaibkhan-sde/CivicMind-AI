import React, { useContext, useState } from 'react';
import useAuth from '../hooks/useAuth.js';
import useSageChat from '../hooks/useSageChat.js';
import { SettingsContext } from '../contexts/SettingsContext.jsx';
import logger from '../utils/logger.js';
import { Trash2 } from 'lucide-react';

/**
 * SettingsView — Immersive settings management.
 * Redesigned for premium visual clarity and professional card-based layout.
 */
export default function SettingsView() {
  const { user, isGuest, signOut, signInWithGoogle } = useAuth();
  const { settings, updateSettings, isHydrated } = useContext(SettingsContext);
  const { clearChat } = useSageChat();
  const [isDeleting, setIsDeleting] = useState(false);

  // ... previous logic

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to delete all chat history with Sage? This cannot be undone.")) {
      clearChat();
      alert("Chat history has been cleared.");
    }
  };

  if (!isHydrated) {
    return (
      <div className="tab-pane settings-pane">
        <div className="spinner" role="status" aria-label="Loading settings..." />
      </div>
    );
  }

  const handleThemeChange = (e) => {
    updateSettings('preferences', { theme: e.target.value });
    document.documentElement.setAttribute('data-theme', e.target.value);
  };

  const handleFontSizeChange = (e) => {
    updateSettings('preferences', { fontSize: parseInt(e.target.value, 10) });
    document.documentElement.style.setProperty('--base-font-size', `${e.target.value}px`);
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your quiz progress? This will clear your streak and XP in demo mode.")) {
      localStorage.removeItem('civic_xp_temp');
      localStorage.removeItem('civic_streak_temp');
      window.location.reload();
    }
  };

  return (
    <div className="tab-pane settings-pane">
      <header className="tab-header">
        <h1>Settings</h1>
        <p className="text-muted">Personalize your Civic Adventure and manage your data.</p>
      </header>

      <div className="settings-container">
        {/* ── Card 1: Account ────────────────────────────────────────── */}
        <div className="settings-card">
          <h2 className="settings-section-title">Account Profile</h2>
          {isGuest ? (
            <div className="guest-info" style={{ textAlign: 'center' }}>
              <p className="setting-desc" style={{ marginBottom: '16px' }}>
                You are playing in <strong>Guest Mode</strong>. Sign in to sync your progress across devices.
              </p>
              <button className="badge save" onClick={signInWithGoogle} style={{ width: '100%', padding: '12px' }}>
                Sign in with Google
              </button>
            </div>
          ) : (
            <>
              <div className="user-profile-header">
                <div className="user-avatar-large">
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
                <div className="user-details">
                  <h3>{user.displayName || 'Civic Explorer'}</h3>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="account-actions" style={{ display: 'flex', gap: '10px' }}>
                <button className="badge" style={{ flex: 1 }} onClick={signOut}>Sign Out</button>
                <button className="btn-settings-danger" style={{ flex: 1 }} onClick={() => alert("Account deletion is disabled in demo mode.")}>
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Card 2: Personalization ────────────────────────────────── */}
        <div className="settings-card">
          <h2 className="settings-section-title">Visual Appearance</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Interface Theme</label>
              <p className="setting-desc">Switch between modes for better comfort.</p>
            </div>
            <select 
              value={settings.preferences.theme} 
              onChange={handleThemeChange}
              className="select-input-premium"
            >
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Text Scaling</label>
              <p className="setting-desc">Size: {settings.preferences.fontSize}px</p>
            </div>
            <input 
              type="range" 
              min="14" 
              max="20" 
              value={settings.preferences.fontSize} 
              onChange={handleFontSizeChange} 
              className="range-input-premium"
            />
          </div>
        </div>

        {/* ── Card 3: AI Preferences ─────────────────────────────────── */}
        <div className="settings-card">
          <h2 className="settings-section-title">Sage Intelligence</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Mentor Voice</label>
              <p className="setting-desc">Adjust how Sage explains concepts.</p>
            </div>
            <select 
              value={settings.ai.style} 
              onChange={(e) => updateSettings('ai', { style: e.target.value })}
              className="select-input-premium"
            >
              <option value="simple">Simple & Direct</option>
              <option value="standard">Standard Balanced</option>
              <option value="academic">Advanced Analysis</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Mission Difficulty</label>
              <p className="setting-desc">Challenge level for generated quizzes.</p>
            </div>
            <select 
              value={settings.ai.difficulty} 
              onChange={(e) => updateSettings('ai', { difficulty: e.target.value })}
              className="select-input-premium"
            >
              <option value="easy">Beginner</option>
              <option value="medium">Intermediate</option>
              <option value="hard">Expert</option>
            </select>
          </div>
        </div>

        {/* ── Card 4: Privacy & Data ─────────────────────────────────── */}
        <div className="settings-card">
          <h2 className="settings-section-title">Privacy & Reset</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Personalized Learning</label>
              <p className="setting-desc">Allow Sage to adapt based on your weak topics.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.learningData?.useLearningData} 
              onChange={(e) => updateSettings('learningData', { useLearningData: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Chat Conversation</label>
              <p className="setting-desc">Permanently delete your chat history with Sage.</p>
            </div>
            <button className="btn-settings-danger" onClick={handleClearChat}>
              <Trash2 size={14} style={{ marginRight: '8px' }} />
              Clear History
            </button>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Wipe Progress</label>
              <p className="setting-desc">Reset all missions, XP, and streaks.</p>
            </div>
            <button className="btn-settings-danger" onClick={handleResetProgress}>Reset All Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
