/**
 * @fileoverview XPNotification — Level-up overlay with celebrations.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a celebration overlay when the user levels up.
 * @param {Object} props
 * @param {number} props.newLevel
 * @param {string} props.newTitle
 * @param {Function} props.onClose
 */
export default function XPNotification({ newLevel, newTitle, isVictory, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 400); // Wait for fade out
    }, 5000); // Increased to 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!newLevel && !isVictory) return null;

  const isFinalLevel = isVictory; // Locked to Victory event

  return (
    <div 
      className={`levelup-overlay ${isVisible ? 'active' : ''} ${isFinalLevel ? 'final-victory' : ''}`} 
      role="alert"
      onClick={() => {
        if (!isFinalLevel) {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      }}
    >
      <div className="levelup-card" onClick={e => e.stopPropagation()}>
        <div className="confetti-cannon">{isFinalLevel ? '🏆✨🎊' : '🎉'}</div>
        <h2 className="levelup-heading">{isFinalLevel ? 'DEMOCRACY MASTERED!' : 'LEVEL UP!'}</h2>
        
        <div className={`levelup-badge ${isFinalLevel ? 'gold-glow' : ''}`}>
          <span className="lvl-num">{isFinalLevel ? 'M' : newLevel}</span>
        </div>
        
        <p className="levelup-text">{isFinalLevel ? 'You have graduated as a' : 'You are now a'}</p>
        <h3 className="levelup-title">{isFinalLevel ? 'Constitutional Master' : newTitle}</h3>
        
        {isFinalLevel ? (
          <div className="final-statement">
            <p>"The power of a democracy lies not just in the hands of the leaders, but in the wisdom of every informed citizen."</p>
            <div className="sage-quote">― Sage, Your Civic Mentor 🦉</div>
          </div>
        ) : (
          <p className="levelup-subtext">Your civic wisdom grows stronger! 🦉</p>
        )}
        
        <button 
          className="levelup-close-btn"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          {isFinalLevel ? 'Finish Adventure' : 'Continue Adventure'}
        </button>
      </div>
    </div>
  );
}

XPNotification.propTypes = {
  newLevel: PropTypes.number,
  newTitle: PropTypes.string,
  isVictory: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
