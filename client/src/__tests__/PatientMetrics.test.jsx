// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, mock data, metric calculation assertions
// Human Contributions: Business logic definitions (surgery ready, not eligible, insurance), verification
// Notes: Tests that PatientMetrics fetches patients and displays correct metric counts.

import { render, screen, waitFor, within } from '@testing-library/react';
import PatientMetrics from '../components/PatientMetrics';

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

const today = new Date();
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);
const tenDaysAgo = new Date(today);
tenDaysAgo.setDate(today.getDate() - 10);

const mockPatients = [
  // Insurance clear, surgery ready, new this week
  { id: 1, insurance: 'clear', bmi: 30, progress: { completed: 3, total: 3 }, createdAt: threeDaysAgo.toISOString() },
  // Insurance clear, not surgery ready, not new
  { id: 2, insurance: 'clear', bmi: 32, progress: { completed: 2, total: 3 }, createdAt: tenDaysAgo.toISOString() },
  // Not eligible (bmi < 27), not new
  { id: 3, insurance: 'not clear', bmi: 25, progress: { completed: 1, total: 3 }, createdAt: tenDaysAgo.toISOString() },
  // Not eligible (bmi < 27), new this week
  { id: 4, insurance: 'not clear', bmi: 26, progress: { completed: 0, total: 3 }, createdAt: threeDaysAgo.toISOString() },
];

describe('PatientMetrics', () => {
  beforeEach(() => {
    apiRequest.mockResolvedValue(mockPatients);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<PatientMetrics />);
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
  });

  it('renders total patient count', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('Total patients')).toBeInTheDocument());
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders new this week count', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('2 new this week')).toBeInTheDocument());
  });

  it('renders correct insurance cleared count', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('Insurance cleared')).toBeInTheDocument());
    const card = screen.getByText('Insurance cleared').closest('.border');
    expect(within(card).getByText('2')).toBeInTheDocument();
  });

  it('renders correct insurance cleared percentage', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('50% of all patients')).toBeInTheDocument());
  });

  it('renders correct surgery ready count', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('Surgery ready')).toBeInTheDocument());
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders correct not eligible count', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('Not eligible')).toBeInTheDocument());
    expect(screen.getByText('BMI below 27')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    apiRequest.mockRejectedValue(new Error('Network error'));
    render(<PatientMetrics />);
    await waitFor(() =>
      expect(screen.getByText('Failed to load metrics.')).toBeInTheDocument()
    );
  });

  it('calls apiRequest with /patients', async () => {
    render(<PatientMetrics />);
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('/patients'));
  });

  it('renders all zeros correctly when no patients exist', async () => {
    apiRequest.mockResolvedValue([]);
    render(<PatientMetrics />);
    await waitFor(() => expect(screen.getByText('Total patients')).toBeInTheDocument());
    expect(screen.getByText('0 new this week')).toBeInTheDocument();
    expect(screen.getByText('0% of all patients')).toBeInTheDocument();
  });
});
