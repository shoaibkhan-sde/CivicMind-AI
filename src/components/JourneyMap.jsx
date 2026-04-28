/**
 * @fileoverview JourneyMap — The core navigation and progress hub.
 * @module JourneyMap
 * @requires useJourney
 * @requires useSageChat
 */

import React, { useState, useRef, useEffect } from 'react';
import SageHero from './SageHero';
import ConfirmModal from './ConfirmModal';
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
  Check,
  ChevronDown,
  Trash2
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
  const { messages, sendMessage, isLoading, clearChat } = useSageChat('journey');
  const { xpState } = useXP();
  const chatRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // 🔥 Auto-progression: When a stage is completed, jump to the next one!
  useEffect(() => {
    setSelectedStageId(currentStage.id);
  }, [currentStage.id]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
      // Show button if user has scrolled up more than 150px from bottom
      const isUp = scrollHeight - scrollTop - clientHeight > 150;
      setShowScrollButton(isUp);
    }
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !locked) {
                      e.preventDefault();
                      setSelectedStageId(stage.id);
                    }
                  }}
                  role="button"
                  tabIndex={locked ? -1 : 0}
                  aria-disabled={locked}
                  aria-label={`Stage ${stage.order}: ${stage.title}${locked ? ' (Locked)' : ''}`}
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
              
              <div className="assistant-actions">
                <span className="live-badge">Live</span>
              </div>
            </header>

            <div className="assistant-context">
              <MapPin size={14} className="icon-gold" />
              <span>Context: {selectedStage?.title} Stage · Level: {xpState.level}</span>
            </div>

            <div className="assistant-messages" ref={chatRef} onScroll={handleScroll}>
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

            {/* Scroll to Bottom Button */}
            <button 
              className={`scroll-bottom-btn ${showScrollButton ? 'visible' : ''}`}
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ChevronDown size={20} />
            </button>

            <div className="assistant-input-area">
              <div className="input-container-premium">
                {messages.length > 0 && (
                  <button 
                    className="btn-clear-chat-small" 
                    onClick={() => setIsClearModalOpen(true)}
                    title="Clear history"
                    style={{ marginLeft: '12px', marginRight: '-4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
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
      <ConfirmModal 
        isOpen={isClearModalOpen}
        title="Clear Journey Chat?"
        message="This will permanently delete your conversation with Sage in this tab. Are you sure?"
        onConfirm={() => {
          clearChat();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}

export default React.memo(JourneyMap);
