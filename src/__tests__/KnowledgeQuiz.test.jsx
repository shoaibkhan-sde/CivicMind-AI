/**
 * @fileoverview Tests for KnowledgeQuiz component.
 * Covers question rendering, answer selection feedback,
 * score tracking, and results screen.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeQuiz from '../../components/KnowledgeQuiz.jsx';
import { QUIZ_QUESTIONS } from '../../utils/constants.js';

// Mock firebase
jest.mock('../../firebase.js', () => ({
  auth: {},
  database: {},
  googleProvider: {},
}));

// Mock useFirebase hook
jest.mock('../../hooks/useFirebase.js', () => {
  return jest.fn(() => ({
    saveScore: jest.fn(),
    leaderboard: [],
    leaderboardLoading: false,
    scoreSaving: false,
  }));
});

// Mock gtag
beforeEach(() => {
  window.gtag = jest.fn();
});

describe('KnowledgeQuiz', () => {
  it('renders the first question on mount', () => {
    render(<KnowledgeQuiz />);
    expect(screen.getByText(QUIZ_QUESTIONS[0].question)).toBeInTheDocument();
  });

  it('all 4 answer options are rendered for the first question', () => {
    render(<KnowledgeQuiz />);
    QUIZ_QUESTIONS[0].options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('selecting an option highlights it with "selected" semantics', () => {
    render(<KnowledgeQuiz />);
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[0]);
    expect(options[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('correct answer gets green class after selecting', () => {
    render(<KnowledgeQuiz />);
    const correctIndex = QUIZ_QUESTIONS[0].correctIndex;
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[correctIndex]);
    expect(options[correctIndex].className).toContain('correct');
  });

  it('wrong answer gets red class and correct answer shows green', () => {
    render(<KnowledgeQuiz />);
    const correctIndex = QUIZ_QUESTIONS[0].correctIndex;
    const wrongIndex = correctIndex === 0 ? 1 : 0;
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[wrongIndex]);
    expect(options[wrongIndex].className).toContain('incorrect');
    expect(options[correctIndex].className).toContain('correct');
  });

  it('explanation is shown after selecting an answer', () => {
    render(<KnowledgeQuiz />);
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[0]);
    expect(screen.getByText(new RegExp(QUIZ_QUESTIONS[0].explanation.slice(0, 20)))).toBeInTheDocument();
  });

  it('Next Question button appears after answering', () => {
    render(<KnowledgeQuiz />);
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[0]);
    expect(screen.getByRole('button', { name: /next question|see results/i })).toBeInTheDocument();
  });

  it('results screen renders after answering all 10 questions', async () => {
    render(<KnowledgeQuiz />);

    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[QUIZ_QUESTIONS[i].correctIndex]);

      const nextBtn = screen.getByRole('button', { name: /next question|see results/i });
      fireEvent.click(nextBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });
  });
});
