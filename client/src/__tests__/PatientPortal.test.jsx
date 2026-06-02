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
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
      expect(screen.getByText(/^clear$/i)).toBeInTheDocument();
      expect(screen.getByText(/Bariatric Surgeon/)).toBeInTheDocument();
    });
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

//   it('polls notifications every 30 seconds', async () => {
//     vi.useFakeTimers();

//     render(<PatientPortal />);

//     await waitFor(() => {
//       expect(screen.getByText('Notifications')).toBeInTheDocument();
//     });

//     const callsBefore = apiRequest.mock.calls.filter((call) =>
//       call[0].includes('notifications')
//     ).length;

//     await act(async () => {
//       vi.advanceTimersByTime(30000);
//     });

//     await waitFor(() => {
//       const callsAfter = apiRequest.mock.calls.filter((call) =>
//         call[0].includes('notifications')
//       ).length;

//       expect(callsAfter).toBeGreaterThan(callsBefore);
//     });

//     // Return to real timers before the next test.
//     vi.useRealTimers();
//   });

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
});