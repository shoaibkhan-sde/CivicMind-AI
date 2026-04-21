/**
 * @fileoverview AIChat component — full AI chat interface powered by Gemini.
 * Features suggested question chips, message bubbles, typing indicator,
 * character counter, and error recovery with retry.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import useGeminiChat from '../hooks/useGeminiChat.js';
import { CHAT_CHIPS, CHAT_MAX_CHARS, CHAT_WARN_CHARS, GA_EVENTS } from '../utils/constants.js';
import { isOverLimit, charsRemaining } from '../utils/sanitize.js';
import logger from '../utils/logger.js';

/** GA4 event tracker */
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
 * @typedef {Object} AIChatProps
 * @property {string} [context='election_education'] - Context hint sent with each message
 */

/**
 * Full AI chat interface component.
 * Messages are added immediately (user), then the AI response arrives asynchronously.
 * Auto-scrolls to the newest message.
 *
 * @param {AIChatProps} props
 * @returns {React.ReactElement}
 */
function AIChat({ context }) {
  const { messages, isLoading, error, retryCountdown, sendMessage, retryLast, clearError } =
    useGeminiChat(context);

  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /** Show chips only when the chat is empty */
  const showChips = useMemo(() => messages.length === 0, [messages]);

  const remaining = useMemo(() => charsRemaining(inputText), [inputText]);
  const isOver = useMemo(() => isOverLimit(inputText), [inputText]);

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
    setInputError('');
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();

    if (!trimmed) {
      setInputError('Please enter a question.');
      return;
    }

    if (isOverLimit(trimmed)) {
      setInputError(`Message must be ${CHAT_MAX_CHARS} characters or fewer.`);
      return;
    }

    setInputText('');
    setInputError('');
    clearError();

    trackEvent(GA_EVENTS.CHAT_MESSAGE_SENT, { context });
    await sendMessage(trimmed);
  }, [inputText, sendMessage, clearError, context]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChipClick = useCallback(
    (chipText) => {
      setInputText(chipText);
      inputRef.current?.focus();
      // Auto-send chip questions
      setTimeout(() => {
        trackEvent(GA_EVENTS.CHAT_MESSAGE_SENT, { context, via: 'chip' });
        sendMessage(chipText);
      }, 100);
    },
    [sendMessage, context]
  );

  return (
    <div className="chat-container">
      {/* Message area */}
      <div
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-relevant="additions"
        id="chat-messages"
      >
        {/* Empty state with chips */}
        {showChips && (
          <div className="chat-empty-state">
            <span className="chat-empty-icon" aria-hidden="true">⚖️</span>
            <p className="chat-empty-text">
              Ask me anything about the election process
            </p>
            <div className="chat-chips" role="group" aria-label="Suggested questions">
              {CHAT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  className="chip"
                  onClick={() => handleChipClick(chip)}
                  aria-label={`Ask: ${chip}`}
                  id={`chip-${chip.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role}`}
            role="article"
            aria-label={`${msg.role === 'user' ? 'You' : 'CivicMind AI'}: ${msg.content}`}
          >
            {msg.role === 'assistant' && (
              <div className="chat-avatar" aria-hidden="true">⚖️</div>
            )}
            <div className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="chat-message assistant" aria-label="CivicMind AI is typing">
            <div className="chat-avatar" aria-hidden="true">⚖️</div>
            <div className="chat-bubble assistant">
              <div className="typing-indicator" aria-hidden="true">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="chat-error" role="alert">
            <span>⚠</span>
            <span style={{ flex: 1 }}>
              {retryCountdown > 0
                ? `Rate limit reached. Please wait ${retryCountdown}s.`
                : error}
            </span>
            {retryCountdown === 0 && (
              <button
                className="btn btn-ghost"
                onClick={retryLast}
                aria-label="Retry sending the last message"
                style={{ fontSize: '12px', padding: '4px 10px' }}
                id="chat-retry-btn"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Input error */}
        {inputError && (
          <p role="alert" style={{ color: 'var(--error)', fontSize: '12px', textAlign: 'right' }}>
            {inputError}
          </p>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {/* Character counter */}
        <p
          className={`chat-char-count${isOver ? ' warning' : ''}`}
          aria-live="polite"
          aria-label={`${remaining} characters remaining`}
        >
          {remaining} / {CHAT_MAX_CHARS}
        </p>

        <div className="chat-input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your election question…"
            aria-label="Type your election question"
            aria-describedby="chat-char-hint"
            rows={1}
            maxLength={CHAT_MAX_CHARS + 50} // slight overrun so user sees the counter turn red
            disabled={isLoading || retryCountdown > 0}
            id="chat-input-field"
            style={{ resize: 'none', overflowY: 'hidden' }}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={isLoading || !inputText.trim() || isOver || retryCountdown > 0}
            aria-label="Send message"
            id="chat-send-btn"
          >
            ➤
          </button>
        </div>

        <p id="chat-char-hint" className="text-small" style={{ marginTop: 6, textAlign: 'center' }}>
          Powered by Gemini 1.5 Flash · Press Enter to send
        </p>
      </div>
    </div>
  );
}

AIChat.propTypes = {
  context: PropTypes.string,
};

AIChat.defaultProps = {
  context: 'election_education',
};

export default AIChat;
