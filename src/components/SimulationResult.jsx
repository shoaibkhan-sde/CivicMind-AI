/**
 * @fileoverview SimulationResult — Detailed outcome screen for the adventure.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders simulation summary and decision tree.
 */
export default function SimulationResult({ stats, history, onRestart }) {
  const [votes, setVotes] = useState(0);
  const targetVotes = Math.floor((stats.trust + stats.reach + stats.momentum) * 1500);
  const isWin = targetVotes > 50000; // Arbitrary win threshold

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil(targetVotes / 50);
      if (current >= targetVotes) {
        setVotes(targetVotes);
        clearInterval(interval);
      } else {
        setVotes(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [targetVotes]);

  return (
    <div className="sim-result-page">
      <div className="result-header">
        <div className="result-badge">{isWin ? '🏆' : '📉'}</div>
        <h2 className="result-title">{isWin ? 'VICTORY!' : 'A HARD-FOUGHT LOSS'}</h2>
        <div className="vote-counter">
          <span className="vote-num">{votes.toLocaleString()}</span>
          <span className="vote-label">Votes Earned</span>
        </div>
      </div>

      <div className="result-grid">
        <div className="result-section decisions">
          <h3>Your Key Decisions</h3>
          <div className="decision-tree">
            {history.map((h, i) => (
              <div key={i} className="tree-node">
                <div className="tree-connector" />
                <div className="tree-content">
                  <span className="tree-day">Day {h.day}</span>
                  <span className="tree-choice">{h.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="result-section lessons">
          <h3>Sage's Analysis 🦉</h3>
          <p className="sage-feedback">
            {isWin 
              ? "Your high trust among the rural voters was the key. You prioritized integrity over quick reach!"
              : "A narrow loss, but a great learning experience. Next time, try focusing more on reach in the early campaign phases."}
          </p>
          <div className="lesson-chips">
            <span className="lesson-chip">✓ Integrity Matters</span>
            <span className="lesson-chip">✓ Budget Management</span>
            <span className="lesson-chip">✓ Public Reach</span>
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn-primary" onClick={onRestart}>Try Different Strategy</button>
        <button className="btn-secondary" onClick={() => window.print()}>Print Campaign Report</button>
      </div>
    </div>
  );
}

SimulationResult.propTypes = {
  stats: PropTypes.object.isRequired,
  history: PropTypes.array.isRequired,
  onRestart: PropTypes.func.isRequired,
};
