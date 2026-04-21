/**
 * @fileoverview Tests for useGeminiChat hook.
 * Covers message sending, API success/error handling, and empty input blocking.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useGeminiChat from '../../hooks/useGeminiChat.js';

// Mock DOMPurify for jsdom environment
jest.mock('dompurify', () => ({
  sanitize: (html) => html,
}));

// Mock firebase
jest.mock('../../firebase.js', () => ({
  auth: {},
  database: {},
  googleProvider: {},
}));

// Global fetch mock
global.fetch = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe('useGeminiChat', () => {
  it('starts with empty messages, isLoading=false, error=null', () => {
    const { result } = renderHook(() => useGeminiChat());

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sendMessage adds user message and assistant reply on API success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ reply: 'You need to be 18 to vote.', timestamp: new Date().toISOString() }),
      headers: { get: () => null },
    });

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.sendMessage('What is the voting age?');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('What is the voting age?');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('You need to be 18 to vote.');
    expect(result.current.isLoading).toBe(false);
  });

  it('sendMessage sets error state on API failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error', code: 'INTERNAL_ERROR' }),
      headers: { get: () => null },
    });

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.sendMessage('What is the voting age?');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('sendMessage with empty string does not call fetch', async () => {
    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });

  it('clearError resets the error state', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
      headers: { get: () => null },
    });

    const { result } = renderHook(() => useGeminiChat());

    await act(async () => {
      await result.current.sendMessage('Test question');
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
