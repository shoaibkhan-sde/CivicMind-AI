/**
 * @fileoverview SageMentor — Full-screen conversation hub.
 */

import React, { useRef, useEffect } from 'react';
import useSageChat from '../hooks/useSageChat';
import useXP from '../hooks/useXP';
import { Bot, Trash2, SendHorizontal, Sparkles, ChevronDown } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

/**
 * Sage Mentor view.
 */
export default function SageMentor() {
  const { messages, sendMessage, isLoading, clearChat } = useSageChat('mentor');
  const { xpState } = useXP();
  const scrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isUp = scrollHeight - scrollTop - clientHeight > 150;
      setShowScrollButton(isUp);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const input = e.target.elements.message;
    if (input.value.trim()) {
      sendMessage(input.value);
      input.value = '';
    }
  };

  return (
    <div className="sage-mentor-page">
      <div className="mentor-minimal-badge">
        <Bot size={24} className="icon-blue" />
      </div>

      <div className="mentor-chat-window" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="mentor-welcome">
            <div className="welcome-icon-vector"><Sparkles size={48} className="icon-gold" /></div>
            <h2>Greetings, {xpState.title}!</h2>
            <p>I'm here to help you navigate the complex world of Indian democracy. Ask me anything about elections, voting, or your civic journey!</p>
            <div className="suggestion-grid">
              <button className="suggestion-chip" onClick={() => sendMessage("How do I register to vote?")}>How do I register?</button>
              <button className="suggestion-chip" onClick={() => sendMessage("What are the eligibility criteria for a candidate?")}>Candidate criteria?</button>
              <button className="suggestion-chip" onClick={() => sendMessage("Explain the Model Code of Conduct.")}>Explain MCC</button>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`mentor-msg ${m.role}`}>
              <div className="msg-bubble">
                {m.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mentor-msg assistant loading">
            <div className="msg-bubble">
              <span className="typing-dots">
                <span></span><span></span><span></span>
              </span>
              Sage is crafting a response...
            </div>
          </div>
        )}
      </div>

      <button 
        className={`scroll-bottom-btn ${showScrollButton ? 'visible' : ''}`}
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
      >
        <ChevronDown size={24} />
      </button>

      <div className="mentor-input-container">
        <form className="mentor-input-form-premium" onSubmit={handleSend}>
          {messages.length > 0 && (
            <button 
              type="button" 
              className="mentor-clear-btn" 
              onClick={() => setIsClearModalOpen(true)}
              title="Clear History"
            >
              <Trash2 size={18} />
            </button>
          )}
          <input 
            name="message" 
            autoComplete="off" 
            placeholder="Type your question for Sage..." 
            disabled={isLoading}
          />
          <button type="submit" className="mentor-send-btn" disabled={isLoading || !messages}>
            {isLoading ? <Sparkles size={18} className="animate-pulse" /> : <SendHorizontal size={18} />}
          </button>
        </form>
      </div>
      <ConfirmModal 
        isOpen={isClearModalOpen}
        title="Clear Mentor History?"
        message="This will delete your entire conversation with Sage the Mentor. This action cannot be undone."
        onConfirm={() => {
          clearChat();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}
