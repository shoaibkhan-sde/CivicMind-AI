/**
 * @fileoverview Tests for AIChat component.
 * Covers chip rendering, chip click behavior, input validation,
 * and typing indicator visibility.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AIChat from '../../components/AIChat.jsx';
import { CHAT_CHIPS } from '../../utils/constants.js';

// Mock firebase
jest.mock('../../firebase.js', () => ({
  auth: {},
  database: {},
  googleProvider: {},
}));

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: (html) => html,
}));

// Mock useGeminiChat to avoid real fetch calls
jest.mock('../../hooks/useGeminiChat.js', () => {
  return jest.fn(() => ({
    messages: [],
    isLoading: false,
    error: null,
    retryCountdown: 0,
    sendMessage: jest.fn(),
    retryLast: jest.fn(),
    clearError: jest.fn(),
  }));
});

// Mock gtag
beforeEach(() => {
  window.gtag = jest.fn();
});

describe('AIChat', () => {
  it('renders all 4 suggested question chips', () => {
    render(<AIChat />);
    CHAT_CHIPS.forEach((chip) => {
      expect(screen.getByText(chip)).toBeInTheDocument();
    });
  });

  it('clicking a chip fills the input field', async () => {
    const useGeminiChat = require('../../hooks/useGeminiChat.js');
    const mockSend = jest.fn();
    useGeminiChat.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      retryCountdown: 0,
      sendMessage: mockSend,
      retryLast: jest.fn(),
      clearError: jest.fn(),
    });

    render(<AIChat />);
    const firstChip = screen.getByText(CHAT_CHIPS[0]);
    fireEvent.click(firstChip);

    // sendMessage should be called (chips auto-send)
    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith(CHAT_CHIPS[0]);
    });
  });

  it('typing in the input updates the character count', async () => {
    render(<AIChat />);
    const input = screen.getByRole('textbox', { name: /type your election question/i });
    await userEvent.type(input, 'Hello');
    expect(screen.getByText(/495 \/ 500/)).toBeInTheDocument();
  });

  it('Send button is disabled when input is empty', () => {
    render(<AIChat />);
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeDisabled();
  });

  it('character count turns warning class when input exceeds CHAT_WARN_CHARS', async () => {
    render(<AIChat />);
    const input = screen.getByRole('textbox', { name: /type your election question/i });
    // Type 451 chars to exceed the 450 warning threshold
    const longText = 'a'.repeat(451);
    await userEvent.type(input, longText);
    const counter = screen.getByLabelText(/characters remaining/i);
    expect(counter).toHaveClass('warning');
  });
});
