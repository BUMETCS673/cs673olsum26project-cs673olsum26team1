// AI-USAGE SUMMARY 
// Tools: Claude 
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, basic assertions for rendering and accessibility
// Human Contributions: Verified test logic and structure
// Notes: All code has been AI generated and human reviewed

import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi, beforeEach } from "vitest";

const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal('fetch', mockFetch);

import PatientPortal from "./PatientPortal";

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ 
      user: { name: 'Jane', patientId: 1, token: 'fake-token' },
      setUser: vi.fn(),
      loading: false,
      refreshUser: vi.fn()
    })
  }));

vi.mock('../components/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

beforeEach(() => {
  mockFetch.mockResolvedValue({
    json: async () => ({ progress: { completed: 0, total: 0 } })
  });
});

test("shows banner when all items are complete", async () => {
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ progress: { completed: 7, total: 7 } })
  });

  render(<PatientPortal />);

  await waitFor(() => {
    expect(screen.getByText("You are cleared for surgery!")).toBeInTheDocument();
  });
});

test("hides banner when progress is incomplete", async () => {
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ progress: { completed: 4, total: 7 } })
  });

  render(<PatientPortal />);

  await waitFor(() => {
    expect(screen.queryByText("You are cleared for surgery")).not.toBeInTheDocument();
  });
});
