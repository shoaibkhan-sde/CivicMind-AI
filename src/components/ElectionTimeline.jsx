/**
 * @fileoverview ElectionTimeline component — interactive animated timeline.
 * Displays 7 election stages as clickable nodes connected by a progress line.
 * Clicking a node expands its detail card using the CSS grid trick.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ELECTION_STAGES, GA_EVENTS } from '../utils/constants.js';
import { announceToScreenReader } from '../utils/accessibility.js';
import logger from '../utils/logger.js';

/** GA4 event tracker helper */
function trackEvent(eventName, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    logger.error('GA4 tracking error', err);
  }
}

/**
 * Derives the display state of each node based on the active stage.
 *
 * @param {number} stageId - Stage id (1-indexed)
 * @param {number|null} activeId - Currently expanded stage id
 * @returns {'done'|'active'|'todo'} Visual state for the node circle
 */
function getNodeState(stageId, activeId, completedStages) {
  if (completedStages.includes(stageId)) return 'completed';
  if (stageId === 1 || completedStages.includes(stageId - 1)) {
    if (stageId === activeId) return 'active';
    return 'unlocked';
  }
  return 'locked';
}

/**
 * ElectionTimeline — interactive horizontal timeline of the 7 election stages.
 * Each node is keyboard accessible and announces its state to screen readers.
 *
 * @returns {React.ReactElement}
 */
function ElectionTimeline() {
  const [activeId, setActiveId] = useState(null);
  const [completedStages, setCompletedStages] = useState(() => {
    try {
      const stored = localStorage.getItem('civicmind_progress');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const nodeRefs = useRef({});

  /**
   * Toggle a stage node: collapse if already active, expand otherwise.
   * @param {number} stageId
   */
  const toggleStage = useCallback(
    (stageId) => {
      const stage = ELECTION_STAGES.find((s) => s.id === stageId);
      if (!stage) return;
      
      const nodeState = getNodeState(stageId, activeId, completedStages);
      if (nodeState === 'locked') {
        announceToScreenReader('This stage is locked. Complete previous stages to unlock.');
        return; // Cannot open locked stages
      }

      setActiveId((prev) => {
        const next = prev === stageId ? null : stageId;

        if (next !== null) {
          trackEvent(GA_EVENTS.TIMELINE_STAGE_OPENED, {
            stage_name: stage.title,
            stage_id: stage.id,
          });
          announceToScreenReader(`${stage.title} expanded`);
        } else {
          announceToScreenReader(`${stage.title} collapsed`);
        }

        return next;
      });
    },
    [activeId, completedStages]
  );
  
  const handleCompleteStage = useCallback((stageId) => {
    setCompletedStages(prev => {
      if (prev.includes(stageId)) return prev;
      const next = [...prev, stageId];
      localStorage.setItem('civicmind_progress', JSON.stringify(next));
      return next;
    });
    setActiveId(null); // Collapse after completing
  }, []);

  /**
   * Handle keyboard interactions on a node (Enter and Space expand/collapse).
   * @param {React.KeyboardEvent} e
   * @param {number} stageId
   */
  const handleKeyDown = useCallback(
    (e, stageId) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleStage(stageId);
      }
    },
    [toggleStage]
  );

  /** Active stage object for the detail card */
  const activeStage = useMemo(
    () => ELECTION_STAGES.find((s) => s.id === activeId) || null,
    [activeId]
  );

  return (
    <section className="timeline-container" aria-labelledby="timeline-heading">
      {/* Header */}
      <div className="timeline-header">
        <h2 className="text-title" id="timeline-heading">
          🗓 The Election Lifecycle
        </h2>
        <p className="text-body" style={{ marginTop: 8 }}>
          Click any stage to learn what happens during that phase of the election process.
        </p>
      </div>

      {/* Horizontal nodes + connectors */}
      <div
        className="timeline-nodes-wrapper"
        role="list"
        aria-label="Election timeline stages"
      >
        {ELECTION_STAGES.map((stage, index) => {
          const nodeState = getNodeState(stage.id, activeId, completedStages);
          const isExpanded = activeId === stage.id;
          const isLast = index === ELECTION_STAGES.length - 1;

          return (
            <div
              key={stage.id}
              className="timeline-node-group"
              role="listitem"
            >
              {/* Node */}
              <div
                ref={(el) => { nodeRefs.current[stage.id] = el; }}
                className="timeline-node"
                role="button"
                tabIndex={0}
                onClick={() => toggleStage(stage.id)}
                onKeyDown={(e) => handleKeyDown(e, stage.id)}
                aria-expanded={isExpanded}
                aria-label={`Stage ${stage.id}: ${stage.title}${isExpanded ? ', expanded' : ', click to expand'}${nodeState === 'locked' ? ' (Locked)' : ''}`}
                id={`timeline-node-${stage.id}`}
                style={{ opacity: nodeState === 'locked' ? 0.5 : 1, cursor: nodeState === 'locked' ? 'not-allowed' : 'pointer' }}
              >
                <div className={`timeline-node-circle ${nodeState}`} aria-hidden="true">
                  {nodeState === 'locked' ? '🔒' : nodeState === 'completed' ? '✅' : stage.icon}
                </div>
                <span className="timeline-node-label">{stage.title}</span>
              </div>

              {/* Connector line (not after last node) */}
              {!isLast && (
                <div
                  className={`timeline-connector ${completedStages.includes(stage.id) ? 'completed' : 'pending'}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail card — smooth expand via CSS grid trick */}
      <div
        className={`timeline-detail-wrapper${activeStage ? ' expanded' : ''}`}
        aria-live="polite"
      >
        <div className="timeline-detail-inner">
          {activeStage && (
            <div className="timeline-detail-card card-featured" id="timeline-detail-card">
              <div className="timeline-detail-header">
                <span className="timeline-detail-icon" aria-hidden="true">
                  {activeStage.icon}
                </span>
                <div>
                  <h3 className="timeline-detail-title">{activeStage.title}</h3>
                  <span className="timeline-duration-badge">
                    🕐 {activeStage.duration}
                  </span>
                </div>
              </div>

              <p className="timeline-detail-description">{activeStage.description}</p>

              <h4 className="text-label" style={{ marginBottom: 10 }}>
                Key Facts
              </h4>
              <ul
                className="timeline-key-facts"
                aria-label={`Key facts about ${activeStage.title}`}
              >
                {activeStage.keyFacts.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
              
              {!completedStages.includes(activeStage.id) && (
                <div style={{ marginTop: 20, textAlign: 'right' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleCompleteStage(activeStage.id)}
                  >
                    Complete Mission
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stage overview cards grid */}
      {!activeStage && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 32,
          }}
        >
          {ELECTION_STAGES.map((stage) => (
            <div
              key={stage.id}
              className={`card ${getNodeState(stage.id, null, completedStages) === 'locked' ? 'locked' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => toggleStage(stage.id)}
              onKeyDown={(e) => handleKeyDown(e, stage.id)}
              aria-label={`Open details for stage ${stage.id}: ${stage.title}`}
              style={{ cursor: getNodeState(stage.id, null, completedStages) === 'locked' ? 'not-allowed' : 'pointer', opacity: getNodeState(stage.id, null, completedStages) === 'locked' ? 0.6 : 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>
                  {getNodeState(stage.id, null, completedStages) === 'locked' ? '🔒' : getNodeState(stage.id, null, completedStages) === 'completed' ? '✅' : stage.icon}
                </span>
                <div>
                  <p className="text-label" style={{ marginBottom: 2 }}>
                    Stage {stage.id}
                  </p>
                  <h3 className="text-h3">{stage.title}</h3>
                </div>
              </div>
              <span className="timeline-duration-badge">{stage.duration}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ElectionTimeline;
