// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~95%
// AI-Assisted Areas: MemoryRouter test wrapper, mock date logic, sorting assertions
// Human Contributions: Custom mock data and test expectations mapping

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { apiRequest } from '../utils/api';

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

const today = new Date();
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);

const mockPatients = [
  {
    id: '1',
    mrn: 'MRN001',
    name: 'John Smith',
    bmi: 28.5,
    visitType: 'Bariatric Surgeon',
    insurance: 'clear',
    progress: { completed: 1, total: 3 }, // 33%
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: '2',
    mrn: 'MRN002',
    name: 'Mary Johnson',
    bmi: 32.1,
    visitType: 'Obesity Medicine Specialist',
    insurance: 'not clear',
    progress: { completed: 2, total: 3 }, // 66%
    createdAt: today.toISOString(),
  },
];

const renderSearchBar = (props = {}) =>
  render(
    <MemoryRouter>
      <SearchBar {...props} />
    </MemoryRouter>
  );

describe('SearchBar', () => {
  beforeEach(() => {
    apiRequest.mockResolvedValue(mockPatients);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and filters', async () => {
    renderSearchBar();
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by specialist type/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by insurance status/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /sort patients/i })).not.toBeInTheDocument();
  });

  it('renders sort dropdown when enableSort is true', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: /sort patients/i })).toBeInTheDocument();
  });

  it('displays patient list and showing count', async () => {
    renderSearchBar();
    await waitFor(() => expect(screen.getByTestId('patient-count')).toBeInTheDocument());
    expect(screen.getByText('Showing 2 patients')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Mary Johnson')).toBeInTheDocument();
  });

  it('sorts by newest registered first by default', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const rows = screen.getAllByRole('row');
    // Row 0 is header, Row 1 should be Mary Johnson (newest: today), Row 2 should be John Smith (newest: 3 days ago)
    expect(within(rows[1]).getByText('Mary Johnson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Smith')).toBeInTheDocument();
  });

  it('sorts progress highest first when option selected', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'progress_desc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be Mary Johnson (66%), Row 2 should be John Smith (33%)
    expect(within(rows[1]).getByText('Mary Johnson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Smith')).toBeInTheDocument();
  });

  it('sorts progress lowest first when option selected', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'progress_asc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be John Smith (33%), Row 2 should be Mary Johnson (66%)
    expect(within(rows[1]).getByText('John Smith')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Mary Johnson')).toBeInTheDocument();
  });

  it('sorts by name A to Z when option selected', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'name_asc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be John Smith (J before M), Row 2 should be Mary Johnson
    expect(within(rows[1]).getByText('John Smith')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Mary Johnson')).toBeInTheDocument();
  });

  it('sorts by BMI highest first when option selected', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'bmi_desc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be Mary Johnson (BMI 32.1), Row 2 should be John Smith (BMI 28.5)
    expect(within(rows[1]).getByText('Mary Johnson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Smith')).toBeInTheDocument();
  });

  it('sorts by name Z to A when option selected', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'name_desc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be Mary Johnson (M before J descending), Row 2 should be John Smith
    expect(within(rows[1]).getByText('Mary Johnson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Smith')).toBeInTheDocument();
  });

  it('sorts by BMI lowest first when option selected', async () => {
    renderSearchBar({ enableSort: true });
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument());

    const sortSelect = screen.getByRole('combobox', { name: /sort patients/i });
    fireEvent.change(sortSelect, { target: { value: 'bmi_asc' } });

    const rows = screen.getAllByRole('row');
    // Row 1 should be John Smith (BMI 28.5), Row 2 should be Mary Johnson (BMI 32.1)
    expect(within(rows[1]).getByText('John Smith')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Mary Johnson')).toBeInTheDocument();
  });
});
