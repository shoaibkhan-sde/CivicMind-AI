/**
 * @fileoverview Tests for ElectionTimeline component.
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ElectionTimeline from '../components/ElectionTimeline.jsx';
import { ELECTION_STAGES } from '../utils/constants.js';

beforeEach(() => {
  window.gtag = jest.fn();
});

describe('ElectionTimeline', () => {
  it('renders the timeline heading', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/The Election Lifecycle/i)).toBeInTheDocument();
  });

  it('renders all 7 overview stage cards', () => {
    render(<ElectionTimeline />);
    ELECTION_STAGES.forEach((stage) => {
      expect(screen.getAllByText(stage.title).length).toBeGreaterThan(0);
    });
  });

  it('clicking a timeline node sets aria-expanded to true', () => {
    render(<ElectionTimeline />);
    // The node buttons have id="timeline-node-N" — use that for exact targeting
    const firstNode = document.getElementById('timeline-node-1');
    fireEvent.click(firstNode);
    expect(firstNode).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking the same node again collapses it', () => {
    render(<ElectionTimeline />);
    const firstNode = document.getElementById('timeline-node-1');
    fireEvent.click(firstNode);
    expect(firstNode).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(firstNode);
    expect(firstNode).toHaveAttribute('aria-expanded', 'false');
  });

  it('pressing Enter on a node expands it', () => {
    render(<ElectionTimeline />);
    const firstNode = document.getElementById('timeline-node-1');
    fireEvent.keyDown(firstNode, { key: 'Enter', code: 'Enter' });
    expect(firstNode).toHaveAttribute('aria-expanded', 'true');
  });

  it('pressing Space on a node expands it', () => {
    render(<ElectionTimeline />);
    const secondNode = document.getElementById('timeline-node-2');
    fireEvent.keyDown(secondNode, { key: ' ', code: 'Space' });
    expect(secondNode).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the first key fact when a node is expanded', () => {
    render(<ElectionTimeline />);
    const firstStage = ELECTION_STAGES[0];
    const firstNode = document.getElementById('timeline-node-1');
    fireEvent.click(firstNode);
    // The detail card renders the stage title as a heading
    expect(screen.getByRole('heading', { name: firstStage.title })).toBeInTheDocument();
  });
});
