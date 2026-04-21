/**
 * @fileoverview Tests for ElectionTimeline component.
 * Covers rendering, node expand/collapse, and keyboard interaction.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ElectionTimeline from '../../components/ElectionTimeline.jsx';
import { ELECTION_STAGES } from '../../utils/constants.js';

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

describe('ElectionTimeline', () => {
  it('renders all 7 stage nodes', () => {
    render(<ElectionTimeline />);
    ELECTION_STAGES.forEach((stage) => {
      expect(screen.getByText(stage.title)).toBeInTheDocument();
    });
  });

  it('clicking a node sets aria-expanded to true', () => {
    render(<ElectionTimeline />);
    const firstNode = screen.getByRole('button', { name: /Stage 1/i });
    fireEvent.click(firstNode);
    expect(firstNode).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking an expanded node collapses it (aria-expanded becomes false)', () => {
    render(<ElectionTimeline />);
    const firstNode = screen.getByRole('button', { name: /Stage 1/i });
    fireEvent.click(firstNode);
    expect(firstNode).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(firstNode);
    expect(firstNode).toHaveAttribute('aria-expanded', 'false');
  });

  it('pressing Enter on a node expands it', () => {
    render(<ElectionTimeline />);
    const firstNode = screen.getByRole('button', { name: /Stage 1/i });
    fireEvent.keyDown(firstNode, { key: 'Enter', code: 'Enter' });
    expect(firstNode).toHaveAttribute('aria-expanded', 'true');
  });

  it('pressing Space on a node expands it', () => {
    render(<ElectionTimeline />);
    const secondNode = screen.getByRole('button', { name: /Stage 2/i });
    fireEvent.keyDown(secondNode, { key: ' ', code: 'Space' });
    expect(secondNode).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the stage detail card when a node is expanded', () => {
    render(<ElectionTimeline />);
    const firstStage = ELECTION_STAGES[0];
    const firstNode = screen.getByRole('button', { name: /Stage 1/i });
    fireEvent.click(firstNode);
    expect(screen.getByText(firstStage.duration)).toBeInTheDocument();
  });
});
