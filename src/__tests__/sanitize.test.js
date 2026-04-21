/**
 * @fileoverview Tests for sanitize.js utility functions.
 * Covers all sanitization scenarios including HTML stripping,
 * empty/oversized input blocking, and whitespace trimming.
 */

import { sanitizeInput, sanitizeHTML, isOverLimit, charsRemaining } from '../utils/sanitize.js';

describe('sanitizeInput', () => {
  it('strips HTML tags from input', () => {
    const result = sanitizeInput('<b>Hello</b> <script>evil()</script> World');
    expect(result).toBe('Hello  World');
  });

  it('throws an error for empty string', () => {
    expect(() => sanitizeInput('')).toThrow('Input cannot be empty');
  });

  it('throws an error for whitespace-only string', () => {
    expect(() => sanitizeInput('   ')).toThrow('Input cannot be empty');
  });

  it('throws an error for strings over 500 characters', () => {
    const over = 'a'.repeat(501);
    expect(() => sanitizeInput(over)).toThrow('Input must not exceed 500 characters');
  });

  it('accepts a string of exactly 500 characters', () => {
    const exactly500 = 'a'.repeat(500);
    expect(() => sanitizeInput(exactly500)).not.toThrow();
    expect(sanitizeInput(exactly500)).toBe(exactly500);
  });

  it('trims leading and trailing whitespace', () => {
    const result = sanitizeInput('  Hello World  ');
    expect(result).toBe('Hello World');
  });

  it('returns clean string for valid input', () => {
    const result = sanitizeInput('How do I register to vote?');
    expect(result).toBe('How do I register to vote?');
  });

  it('throws for non-string input', () => {
    expect(() => sanitizeInput(null)).toThrow('Input must be a string');
    expect(() => sanitizeInput(123)).toThrow('Input must be a string');
  });
});

describe('sanitizeHTML', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeHTML(null)).toBe('');
    expect(sanitizeHTML(undefined)).toBe('');
  });

  it('returns a string for valid HTML', () => {
    const result = sanitizeHTML('<b>Hello</b>');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('isOverLimit', () => {
  it('returns false for strings within limit', () => {
    expect(isOverLimit('Hello')).toBe(false);
  });

  it('returns true for strings over 500 chars', () => {
    expect(isOverLimit('a'.repeat(501))).toBe(true);
  });
});

describe('charsRemaining', () => {
  it('returns 500 for empty string', () => {
    expect(charsRemaining('')).toBe(500);
  });

  it('returns correct remaining count', () => {
    expect(charsRemaining('Hello')).toBe(495);
  });

  it('returns negative number when over limit', () => {
    expect(charsRemaining('a'.repeat(510))).toBe(-10);
  });
});
