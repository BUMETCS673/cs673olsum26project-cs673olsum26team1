// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure and assertions
// Human Contributions: Component knowledge, verification
// Notes: Tests that ReadOnlyBanner renders the correct message and accessibility attributes.

import { render, screen } from '@testing-library/react';
import ReadOnlyBanner from '../components/ReadOnlyBanner';

describe('ReadOnlyBanner', () => {
  it('renders the read-only message', () => {
    render(<ReadOnlyBanner />);
    expect(
      screen.getByText(/read only view — you can view all patient data but cannot make changes/i)
    ).toBeInTheDocument();
  });

  it('renders with alert role for accessibility', () => {
    render(<ReadOnlyBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies the correct Bootstrap alert classes', () => {
    render(<ReadOnlyBanner />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('alert');
    expect(banner).toHaveClass('alert-primary');
  });
});