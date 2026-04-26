/**
 * @fileoverview Tests for AIChat component.
 * Covers chip rendering, character counter, and send button state.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AIChat from '../components/AIChat.jsx';
import { CHAT_CHIPS } from '../utils/constants.js';

// Mock useGeminiChat to avoid real fetch calls
jest.mock('../hooks/useGeminiChat.js', () => {
  const mockSendMessage = jest.fn().mockResolvedValue(undefined);
  return jest.fn(() => ({
    messages: [],
    isLoading: false,
    error: null,
    retryCountdown: 0,
    sendMessage: mockSendMessage,
    retryLast: jest.fn(),
    clearError: jest.fn(),
  }));
});

// Mock gtag
beforeEach(() => {
  window.gtag = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AIChat', () => {
  it('renders all 4 suggested question chips', () => {
    render(<AIChat />);
    CHAT_CHIPS.forEach((chip) => {
      expect(screen.getByText(chip)).toBeInTheDocument();
    });
  });

  it('shows the empty state icon on first render', () => {
    render(<AIChat />);
    expect(screen.getByText(/Ask me anything about the election process/i)).toBeInTheDocument();
  });

  it('typing in the input updates the character count display', async () => {
    render(<AIChat />);
    const input = screen.getByRole('textbox', { name: /type your election question/i });
    await userEvent.type(input, 'Hello');
    // 'Hello' is 5 chars: 500 - 5 = 495 remaining
    expect(screen.getByText(/495 \/ 500/)).toBeInTheDocument();
  });

  it('Send button is disabled when the input is empty', () => {
    render(<AIChat />);
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeDisabled();
  });

  it('Send button becomes enabled when the input has text', async () => {
    render(<AIChat />);
    const input = screen.getByRole('textbox', { name: /type your election question/i });
    await userEvent.type(input, 'Test question');
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).not.toBeDisabled();
  });

  it('clicking a chip triggers sendMessage', async () => {
    const useGeminiChat = require('../hooks/useGeminiChat.js');
    const mockSend = jest.fn().mockResolvedValue(undefined);
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

    await waitFor(() => expect(mockSend).toHaveBeenCalledWith(CHAT_CHIPS[0]), { timeout: 500 });
  });
});
