/**
 * @fileoverview SageMentor — Full-screen conversation hub.
 */

import React, { useRef, useEffect } from 'react';
import useSageChat from '../hooks/useSageChat';
import useXP from '../hooks/useXP';
import { Bot, Trash2, SendHorizontal, Sparkles } from 'lucide-react';

/**
 * Sage Mentor view.
 */
export default function SageMentor() {
  const { messages, sendMessage, isLoading, clearChat } = useSageChat();
  const { xpState } = useXP();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

      <div className="mentor-chat-window" ref={scrollRef}>
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

      <div className="mentor-input-container">
        <form className="mentor-input-form-premium" onSubmit={handleSend}>
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
    </div>
  );
}
