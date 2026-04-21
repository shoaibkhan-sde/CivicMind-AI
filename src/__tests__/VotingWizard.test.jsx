/**
 * @fileoverview Tests for VotingWizard component.
 * Covers step rendering, navigation, progress bar, and completion screen.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VotingWizard from '../../components/VotingWizard.jsx';
import { WIZARD_STEPS } from '../../utils/constants.js';

// Mock firebase
jest.mock('../../firebase.js', () => ({
  auth: {},
  database: {},
  googleProvider: {},
}));

// Mock gtag
beforeEach(() => {
  window.gtag = jest.fn();
});

describe('VotingWizard', () => {
  it('renders Step 1 title on mount', () => {
    render(<VotingWizard />);
    expect(screen.getByText(WIZARD_STEPS[0].title)).toBeInTheDocument();
  });

  it('Next button advances to step 2', () => {
    render(<VotingWizard />);
    const nextBtn = screen.getByRole('button', { name: /next step/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(WIZARD_STEPS[1].title)).toBeInTheDocument();
  });

  it('Previous button is disabled on step 1', () => {
    render(<VotingWizard />);
    const prevBtn = screen.getByRole('button', { name: /previous step/i });
    expect(prevBtn).toBeDisabled();
  });

  it('Progress bar role="progressbar" has correct aria-valuenow on step change', () => {
    render(<VotingWizard />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');

    const nextBtn = screen.getByRole('button', { name: /next step/i });
    fireEvent.click(nextBtn);
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
  });

  it('completion screen renders after advancing past the last step', () => {
    render(<VotingWizard />);
    // Advance through all 5 steps
    for (let i = 0; i < WIZARD_STEPS.length; i++) {
      const nextBtn = screen.getByRole('button', { name: /next step|complete/i });
      fireEvent.click(nextBtn);
    }
    expect(screen.getByText(/Ready to Vote/i)).toBeInTheDocument();
  });

  it('step indicator dots are rendered', () => {
    render(<VotingWizard />);
    const dots = screen.getAllByRole('listitem');
    expect(dots.length).toBeGreaterThanOrEqual(WIZARD_STEPS.length);
  });
});
