
// =======================
// MUST BE FIRST (no imports above this)
// =======================

jest.mock("../src/config/firebase", () => ({
  auth: {},
  signOut: jest.fn(),
}));

jest.mock("../src/utils/api", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "test" },
    setUser: jest.fn(),
  }),
}));

// mock router navigation
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: { name: "Test User" },
    }),
  };
});

// =======================
// IMPORTS (AFTER MOCKS ONLY)
// =======================
import { render, screen, fireEvent } from "@testing-library/react";
import BMICalculationPage from "../src/pages/BMICalculationPage";
import { MemoryRouter } from "react-router-dom";

jest.resetModules();

describe("BMICalculationPage - BMI Validation", () => {

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <BMICalculationPage />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("BMI > 27 → patient portal", () => {

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Height (inches)"), {
      target: { value: "65" },
    });

    fireEvent.change(screen.getByPlaceholderText("Weight (pounds)"), {
      target: { value: "200" },
    });

    fireEvent.click(screen.getByText("Calculate BMI"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/patient/portal",
      expect.any(Object)
    );
  });

  test("BMI <= 27 → ineligible", () => {

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Height (inches)"), {
      target: { value: "65" },
    });

    fireEvent.change(screen.getByPlaceholderText("Weight (pounds)"), {
      target: { value: "150" },
    });

    fireEvent.click(screen.getByText("Calculate BMI"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/bmi-ineligible",
      expect.any(Object)
    );
  });

});