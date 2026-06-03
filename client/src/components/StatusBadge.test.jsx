// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, assertions, coverage of all badge types
// Human Contributions: Design requirements, test scope decision

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  describe('type: specialist', () => {
    it('renders Not Eligible with secondary badge', () => {
      render(<StatusBadge type="specialist" value="Not Eligible" />);
      const badge = screen.getByText('Not Eligible');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-secondary');
    });

    it('renders Obesity Medicine Specialist with info badge and short label', () => {
      render(<StatusBadge type="specialist" value="Obesity Medicine Specialist" />);
      const badge = screen.getByText('Obesity Med.');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-info');
    });

    it('renders Endoscopic Obesity Specialist with warning badge and short label', () => {
      render(<StatusBadge type="specialist" value="Endoscopic Obesity Specialist" />);
      const badge = screen.getByText('Endoscopic');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-warning');
    });

    it('renders Bariatric Surgeon with danger badge', () => {
      render(<StatusBadge type="specialist" value="Bariatric Surgeon" />);
      const badge = screen.getByText('Bariatric Surgeon');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-danger');
    });

    it('falls back to secondary badge for unknown specialist value', () => {
      render(<StatusBadge type="specialist" value="Unknown" />);
      const badge = screen.getByText('Unknown');
      expect(badge).toHaveClass('bg-secondary');
    });
  });

  describe('type: insurance', () => {
    it('renders clear with success badge', () => {
      render(<StatusBadge type="insurance" value="clear" />);
      const badge = screen.getByText('Clear');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-success');
    });

    it('renders not clear with danger badge', () => {
      render(<StatusBadge type="insurance" value="not clear" />);
      const badge = screen.getByText('Not Complete');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-danger');
    });

    it('renders self pay with secondary badge', () => {
      render(<StatusBadge type="insurance" value="self pay" />);
      const badge = screen.getByText('Not Required');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-secondary');
    });

    it('renders in review with warning badge', () => {
      render(<StatusBadge type="insurance" value="in review" />);
      const badge = screen.getByText('In Review');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-warning');
    });

    it('falls back to secondary badge for unknown insurance value', () => {
      render(<StatusBadge type="insurance" value="unknown" />);
      const badge = screen.getByText('unknown');
      expect(badge).toHaveClass('bg-secondary');
    });
  });

  describe('type: checklist', () => {
    it('renders not required with secondary badge', () => {
      render(<StatusBadge type="checklist" value="not required" />);
      const badge = screen.getByText('Not Required');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-secondary');
    });

    it('renders not complete with danger badge as Not Started', () => {
      render(<StatusBadge type="checklist" value="not complete" />);
      const badge = screen.getByText('Not Started');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-danger');
    });

    it('renders ordered with primary badge as Scheduled', () => {
      render(<StatusBadge type="checklist" value="ordered" />);
      const badge = screen.getByText('Scheduled');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-primary');
    });

    it('renders in progress with warning badge', () => {
      render(<StatusBadge type="checklist" value="in progress" />);
      const badge = screen.getByText('In Progress');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-warning');
    });

    it('renders complete with success badge', () => {
      render(<StatusBadge type="checklist" value="complete" />);
      const badge = screen.getByText('Complete');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-success');
    });
  });

  it('renders the raw value when type is unrecognized', () => {
    render(<StatusBadge type="unknown" value="some value" />);
    const badge = screen.getByText('some value');
    expect(badge).toHaveClass('bg-secondary');
  });
});
