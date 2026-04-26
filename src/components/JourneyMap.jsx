/**
 * @fileoverview JourneyMap — The core navigation and progress hub.
 * @module JourneyMap
 * @requires useJourney
 * @requires useSageChat
 */

import React, { useState, useRef, useEffect } from 'react';
import SageHero from './SageHero';
import StageCard from './StageCard';
import useJourney from '../hooks/useJourney';
import useSageChat from '../hooks/useSageChat';
import useXP from '../hooks/useXP';
import { 
  Bot, 
  Sparkles, 
  SendHorizontal, 
  MapPin, 
  ChevronRight,
  Bird,
  Megaphone,
  ClipboardList,
  Landmark,
  Mic2,
  Vote,
  Calculator,
  Trophy,
  Lock,
  Check
} from 'lucide-react';

const STAGE_ICON_MAP = {
  announcement: <Megaphone size={18} />,
  registration: <ClipboardList size={18} />,
  nomination: <Landmark size={18} />,
  campaign: <Mic2 size={18} />,
  voting: <Vote size={18} />,
  counting: <Calculator size={18} />,
  results: <Trophy size={18} />,
};

/**
 * Renders the interactive election mission map.
 * Redesigned for premium experience with a sidebar Sage Assistant.
 */
function JourneyMap() {
  const { allStages, completedStages, currentStage, isLocked } = useJourney();
  const [selectedStageId, setSelectedStageId] = useState(currentStage.id);
  const { messages, sendMessage, isLoading } = useSageChat();
  const { xpState } = useXP();
  const chatRef = useRef(null);

  // 🔥 Auto-progression: When a stage is completed, jump to the next one!
  useEffect(() => {
    setSelectedStageId(currentStage.id);
  }, [currentStage.id]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const selectedStage = allStages.find(s => s.id === selectedStageId);

  return (
    <div className="journey-page">
      <SageHero />

      {/* ── Progress Map ── */}
      <div className="journey-map">
        <div className="mission-path">
          {allStages.map((stage, index) => {
            const isDone = completedStages.includes(stage.id);
            const isActive = stage.id === currentStage.id;
            const locked = isLocked(stage.id);
            const isSelected = stage.id === selectedStageId;

            return (
              <div key={stage.id} className="mission-node-group">
                <div 
                  className="mission-node"
                  onClick={() => !locked && setSelectedStageId(stage.id)}
                  aria-label={`Stage ${stage.order}: ${stage.title}`}
                >
                  <div className={`node-circle ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''} ${locked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}>
                    {isDone ? <Check size={16} /> : locked ? <Lock size={14} /> : STAGE_ICON_MAP[stage.id] || stage.icon}
                  </div>
                  <span className="node-label">{stage.title}</span>
                  {isActive && <div className="active-indicator">YOU ARE HERE</div>}
                </div>
                
                {index < allStages.length - 1 && (
                  <div className={`path-connector ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout: Content + Assistant Sidebar ── */}
      <div className="journey-grid">
        <div className="journey-main">
          {selectedStage && <StageCard stageId={selectedStage.id} />}
        </div>
        
        {/* ── Premium Sage Assistant Card (Matches Reference Image) ── */}
        <aside className="journey-sidebar">
          <div className="sage-assistant-card">
            <header className="assistant-header">
              <div className="assistant-title">
                <Bot size={24} className="icon-blue" />
                <h3>Sage · Civic Mentor</h3>
              </div>
              <span className="live-badge">Live</span>
            </header>

            <div className="assistant-context">
              <MapPin size={14} className="icon-gold" />
              <span>Context: {selectedStage?.title} Stage · Level: {xpState.level}</span>
            </div>

            <div className="assistant-messages" ref={chatRef}>
              {messages.length === 0 ? (
                <div className="chat-row assistant">
                  <div className="chat-avatar"><Sparkles size={16} /></div>
                  <div className="chat-bubble assistant">
                    Since you're in the <strong>{selectedStage?.title}</strong> stage, let me ask — do you know how this process impacts the final election?
                  </div>
                </div>
              ) : (
                messages.slice(-10).map((m, i) => (
                  <div key={i} className={`chat-row ${m.role}`}>
                    {m.role === 'assistant' && (
                      <div className="chat-avatar">
                        {m.content.length > 100 ? <Bot size={16} /> : <Sparkles size={16} />}
                      </div>
                    )}
                    <div className={`chat-bubble ${m.role}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="chat-row assistant">
                  <div className="chat-avatar">🦉</div>
                  <div className="chat-bubble assistant thinking">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="assistant-input-area">
              <div className="input-container-premium">
                <input 
                  type="text" 
                  placeholder="Ask Sage anything..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={isLoading}
                />
                <button 
                  className="premium-send-btn"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement.querySelector('input');
                    if (input && input.value.trim()) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  {isLoading ? <Sparkles size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default React.memo(JourneyMap);
