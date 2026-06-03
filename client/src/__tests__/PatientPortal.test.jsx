// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~55%
// AI-Assisted Areas: mock setup, polling timer tests, render assertions
// Human Contributions: test case design, integration with project mock patterns
// Notes: Vitest is used for frontend tests. Fake timers are scoped only to polling test to avoid async test timeouts.

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

// Mock Navbar so it doesn't need router context.
vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));

// Mock AuthContext so PatientPortal has a logged-in patient user.
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Jane Doe', role: 'PATIENT' },
  }),
}));

// Mock Firebase so tests do not initialize real Firebase.
vi.mock('../config/firebase', () => ({
  auth: { currentUser: null },
  onAuthStateChanged: vi.fn(),
}));

// Mock apiRequest so tests do not call the real backend.
vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';
import PatientPortal from '../pages/PatientPortal';

const mockPatientData = {
  id: 1,
  insuranceStatus: 'clear',
  assignedSpecialist: 'Bariatric Surgeon',
  assignedCoordinator: 'Jane Coordinator',
  progress: {
    completed: 2,
    total: 5,
  },
  checklist: [
    { field: 'insurance', status: 'complete' },
    { field: 'labs', status: 'complete' },
    { field: 'consult', status: 'not complete' },
    { field: 'dietitian', status: 'in progress' },
    { field: 'psychologist', status: 'ordered' },
  ],
};

const mockNotifications = [
  {
    id: 1,
    patientId: 1,
    message: 'Your insurance has been cleared.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    patientId: 1,
    message: 'Labs status updated to complete.',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

beforeEach(() => {
  
  vi.useRealTimers();

  apiRequest.mockImplementation((endpoint) => {
    if (endpoint.includes('patients')) return Promise.resolve(mockPatientData);
    if (endpoint.includes('notifications')) return Promise.resolve(mockNotifications);
    return Promise.resolve({});
  });
});

afterEach(() => {
  // Cleanup after every test so timers/mocks do not leak into the next test.
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('PatientPortal', () => {
  it('renders patient name and status after loading', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Jane/)).toBeInTheDocument();
      expect(screen.getByText(/Your appointment checklist for Bariatric Surgeon/i)).toBeInTheDocument();
      expect(screen.getByText(/Your overall preparation progress/)).toBeInTheDocument();
      expect(screen.getByText(/2\/5\s*\(40%\)/)).toBeInTheDocument();
      expect(screen.getByText(/2 items complete/)).toBeInTheDocument();
      expect(screen.getByText(/3 items remaining/)).toBeInTheDocument();
    });
  });

  it('renders checklist items and correct status badges', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('Insurance status')).toBeInTheDocument();
      expect(screen.getByText('Labs')).toBeInTheDocument();
      expect(screen.getByText('Initial consultation')).toBeInTheDocument();
      expect(screen.getByText('Dietitian visits')).toBeInTheDocument();
      expect(screen.getByText('Psychologist visits')).toBeInTheDocument();

      // Verify status badges are present
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('Not Started')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });
  });

  it('renders the checklist as read-only with no edit actions', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('Insurance status')).toBeInTheDocument();
    });

    // There should not be any select elements or save buttons in the checklist table
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('renders notifications list', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('Your insurance has been cleared.')).toBeInTheDocument();
      expect(screen.getByText('Labs status updated to complete.')).toBeInTheDocument();
    });
  });

  it('shows unread badge count', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('1 new')).toBeInTheDocument();
    });
  });

  it('shows Mark read button only on unread notifications', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getAllByText('Mark read')).toHaveLength(1);
    });
  });

  it('marks notification as read when button clicked', async () => {
    apiRequest.mockImplementation((endpoint) => {
      if (endpoint.includes('patients')) return Promise.resolve(mockPatientData);
      if (endpoint.includes('/read')) return Promise.resolve({ id: 1, isRead: true });
      if (endpoint.includes('notifications')) return Promise.resolve(mockNotifications);
      return Promise.resolve({});
    });

    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('Mark read')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Mark read'));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringContaining('/read'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('polls notifications and patient data every 30 seconds', async () => {
    vi.useFakeTimers();

    render(<PatientPortal />);

    // Resolve initial mount promises
    await act(async () => {
      await Promise.resolve();
    });

    const callsBeforeNotifications = apiRequest.mock.calls.filter((call) =>
      call[0].includes('notifications')
    ).length;

    const callsBeforePatients = apiRequest.mock.calls.filter((call) =>
      call[0].includes('patients')
    ).length;

    // Advance time by 30 seconds to trigger the polling interval
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Resolve the promises returned by the polling apiRequest calls
    await act(async () => {
      await Promise.resolve();
    });

    const callsAfterNotifications = apiRequest.mock.calls.filter((call) =>
      call[0].includes('notifications')
    ).length;

    const callsAfterPatients = apiRequest.mock.calls.filter((call) =>
      call[0].includes('patients')
    ).length;

    expect(callsAfterNotifications).toBeGreaterThan(callsBeforeNotifications);
    expect(callsAfterPatients).toBeGreaterThan(callsBeforePatients);

    vi.useRealTimers();
  });

  it('updates checklist status and progress bar when polling returns updated data', async () => {
    vi.useFakeTimers();

    let dynamicPatientData = { ...mockPatientData };
    
    apiRequest.mockImplementation((endpoint) => {
      if (endpoint.includes('patients')) return Promise.resolve(dynamicPatientData);
      if (endpoint.includes('notifications')) return Promise.resolve(mockNotifications);
      return Promise.resolve({});
    });

    render(<PatientPortal />);

    // Resolve initial mount promises
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/2\/5\s*\(40%\)/)).toBeInTheDocument();

    // Change patient data to simulate a coordinator update (labs complete -> everything complete, progress 5/5)
    dynamicPatientData = {
      ...mockPatientData,
      progress: {
        completed: 5,
        total: 5,
      },
      checklist: mockPatientData.checklist.map(item => ({ ...item, status: 'complete' })),
    };

    // Advance time by 30 seconds to trigger interval
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Resolve the promises returned by the polling apiRequest calls
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/5\/5\s*\(100%\)/)).toBeInTheDocument();
    expect(screen.getByText(/5 items complete/)).toBeInTheDocument();
    expect(screen.getByText(/0 items remaining/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('shows empty state when no notifications', async () => {
    
    apiRequest.mockImplementation((endpoint) => {
      if (endpoint.includes('patients')) return Promise.resolve(mockPatientData);
      if (endpoint.includes('notifications')) return Promise.resolve([]);
      return Promise.resolve({});
    });

    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
    });
  });

  it('renders need help section with assigned coordinator', async () => {
    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('Need help?')).toBeInTheDocument();
      expect(screen.getByText(/Your coordinator will contact you to schedule your next steps/)).toBeInTheDocument();
      expect(screen.getByText('Assigned coordinator: Jane Coordinator')).toBeInTheDocument();
    });
  });

  it('shows no coordinator is assigned text if none returned by backend', async () => {
    // Override implementation to return patient data without coordinator
    apiRequest.mockImplementation((endpoint) => {
      if (endpoint.includes('patients')) {
        const { assignedCoordinator, ...rest } = mockPatientData;
        return Promise.resolve(rest);
      }
      if (endpoint.includes('notifications')) return Promise.resolve(mockNotifications);
      return Promise.resolve({});
    });

    render(<PatientPortal />);

    await waitFor(() => {
      expect(screen.getByText('No coordinator is assigned.')).toBeInTheDocument();
    });
  });
});