/**
 * @fileoverview ConfusionAlert — Proactive Sage intervention.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a small overlay when Sage detects user struggle.
 */
export default function ConfusionAlert({ message, onAccept, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!message) return null;

  return (
    <div className={`confusion-alert ${isVisible ? 'active' : ''}`} role="alert">
      <div className="confusion-sage-icon">🦉</div>
      <div className="confusion-content">
        <p className="confusion-text">{message}</p>
        <div className="confusion-actions">
          <button className="btn-accept" onClick={onAccept}>Yes, help me!</button>
          <button className="btn-dismiss" onClick={onDismiss}>I'm okay</button>
        </div>
      </div>
    </div>
  );
}

ConfusionAlert.propTypes = {
  message: PropTypes.string,
  onAccept: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
