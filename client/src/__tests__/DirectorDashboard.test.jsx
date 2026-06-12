// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, mocking strategy, assertions
// Human Contributions: Business logic requirements, component knowledge, verification
// Notes: Tests that DirectorDashboard renders correctly with all child components.

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DirectorDashboard from '../pages/DirectorDashboard';

let searchBarProps = {};

vi.mock('../components/Navbar', () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock('../components/ReadOnlyBanner', () => ({ default: () => <div data-testid="read-only-banner" /> }));
vi.mock('../components/SearchBar', () => ({
  default: (props) => {
    searchBarProps = props;
    return <div data-testid="search-bar" />;
  },
}));
vi.mock('../components/PatientMetrics', () => ({ default: () => <div data-testid="patient-metrics" /> }));
vi.mock('../components/AIChatWidget', () => ({ default: () => <div data-testid="ai-chat-widget" /> }));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Dr. Jane Smith', role: 'PROGRAM_DIRECTOR' },
    loading: false,
  }),
}));

const renderDirectorDashboard = () =>
  render(
    <MemoryRouter>
      <DirectorDashboard />
    </MemoryRouter>
  );

describe('DirectorDashboard', () => {
  beforeEach(() => {
    searchBarProps = {};
  });

  it('renders the page heading', () => {
    renderDirectorDashboard();
    expect(screen.getByText('Program Director Dashboard')).toBeInTheDocument();
  });

  it('renders the pipeline overview subtitle', () => {
    renderDirectorDashboard();
    expect(screen.getByText('Pipeline overview — all patients across the program')).toBeInTheDocument();
  });

  it('renders Navbar', () => {
    renderDirectorDashboard();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders ReadOnlyBanner', () => {
    renderDirectorDashboard();
    expect(screen.getByTestId('read-only-banner')).toBeInTheDocument();
  });

  it('renders PatientMetrics', () => {
    renderDirectorDashboard();
    expect(screen.getByTestId('patient-metrics')).toBeInTheDocument();
  });

  it('renders SearchBar', () => {
    renderDirectorDashboard();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders AIChatWidget', () => {
    renderDirectorDashboard();
    expect(screen.getByTestId('ai-chat-widget')).toBeInTheDocument();
  });

  it('passes disableClick to SearchBar so directors cannot navigate to patient detail', () => {
    renderDirectorDashboard();
    expect(searchBarProps.disableClick).toBe(true);
  });

  it('does not render any edit or update controls', () => {
    renderDirectorDashboard();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });
});
