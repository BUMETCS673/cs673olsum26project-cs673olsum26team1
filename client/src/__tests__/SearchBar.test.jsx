// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~95%
// AI-Assisted Areas: Test design, mock data setup, and sorting assertion details
// Human Contributions: Ensuring compatibility with SearchBar component props and CSS queries

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import SearchBar from '../components/SearchBar';
import { apiRequest } from '../utils/api';

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

const mockPatients = [
  {
    id: '1',
    mrn: 'MRN001',
    name: 'John Smith',
    bmi: 28.5,
    visitType: 'Bariatric Surgeon',
    insurance: 'clear',
    progress: { completed: 1, total: 3 }, // 33%
  },
  {
    id: '2',
    mrn: 'MRN002',
    name: 'Mary Johnson',
    bmi: 32.1,
    visitType: 'Obesity Medicine Specialist',
    insurance: 'not clear',
    progress: { completed: 2, total: 3 }, // 66%
  },
];

describe('SearchBar', () => {
  beforeEach(() => {
    apiRequest.mockResolvedValue(mockPatients);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and filters', async () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by specialist type/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by insurance status/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /sort patients/i })).not.toBeInTheDocument();
  });

  it('renders sort dropdown when enableSort is true', async () => {
    render(<SearchBar enableSort />);
    expect(screen.getByRole('combobox', { name: /sort patients/i })).toBeInTheDocument();
  });

  it('displays patient list and showing count', async () => {
    render(<SearchBar />);
    await waitFor(() => expect(screen.getByTestId('patient-count')).toBeInTheDocument());
    expect(screen.getByText('Showing 2 patients')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Mary Johnson')).toBeInTheDocument();
  });

  it('sorts progress highest first by default', async () => {
    render(<SearchBar enableSort />);
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const rows = screen.getAllByRole('row');
    // Row 0 is header, Row 1 should be Mary Johnson (66%), Row 2 should be John Smith (33%)
    expect(within(rows[1]).getByText('Mary Johnson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Smith')).toBeInTheDocument();
  });

  it('sorts progress lowest first when option selected', async () => {
    render(<SearchBar enableSort />);
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'progress_asc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be John Smith (33%), Row 2 should be Mary Johnson (66%)
    expect(within(rows[1]).getByText('John Smith')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Mary Johnson')).toBeInTheDocument();
  });

  it('sorts by name A to Z when option selected', async () => {
    render(<SearchBar enableSort />);
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'name_asc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be John Smith (J before M), Row 2 should be Mary Johnson
    expect(within(rows[1]).getByText('John Smith')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Mary Johnson')).toBeInTheDocument();
  });

  it('sorts by BMI highest first when option selected', async () => {
    render(<SearchBar enableSort />);
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'bmi_desc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be Mary Johnson (BMI 32.1), Row 2 should be John Smith (BMI 28.5)
    expect(within(rows[1]).getByText('Mary Johnson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Smith')).toBeInTheDocument();
  });
});
