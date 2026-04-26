/**
 * @fileoverview Tests for KnowledgeQuiz component.
 * Covers question rendering, answer selection feedback,
 * score tracking, and results screen.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeQuiz from '../components/KnowledgeQuiz.jsx';
import { QUIZ_QUESTIONS } from '../utils/constants.js';

// Mock useFirebase hook
jest.mock('../hooks/useFirebase.js', () => {
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

  it('selecting an option marks it as aria-checked=true', () => {
    render(<KnowledgeQuiz />);
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[0]);
    expect(options[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('correct answer gets "correct" class after answering', () => {
    render(<KnowledgeQuiz />);
    const correctIndex = QUIZ_QUESTIONS[0].correctIndex;
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[correctIndex]);
    expect(options[correctIndex].className).toContain('correct');
  });

  it('wrong answer gets "incorrect" class', () => {
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

  it('a next/results button appears after answering', () => {
    render(<KnowledgeQuiz />);
    const options = screen.getAllByRole('radio');
    fireEvent.click(options[0]);
    // Button aria-label is "Go to next question" or "See your results"
    const nextBtn = screen.getByRole('button', { name: /go to next question|see your results/i });
    expect(nextBtn).toBeInTheDocument();
  });

  it('results screen renders after completing all 10 questions', async () => {
    render(<KnowledgeQuiz />);

    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[QUIZ_QUESTIONS[i].correctIndex]);

      // The last question's next btn says "See your results"
      const isLast = i === QUIZ_QUESTIONS.length - 1;
      const nextBtn = screen.getByRole('button', {
        name: isLast ? /see your results/i : /go to next question/i,
      });
      fireEvent.click(nextBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });
  });
});
