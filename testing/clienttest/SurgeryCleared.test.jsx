// AI-USAGE SUMMARY 
// Tools: Claude 
// Overall AI Contribution: 90%
// AI-Assisted Areas: Test structure, basic assertions for rendering and accessibility
// Human Contributions: Verified test logic and structure
// Notes: All code has been AI generated and human reviewed

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import SurgeryCleared from "./SurgeryCleared";

test("renders the cleared for surgery message", () => {
  render(<SurgeryCleared />);
  expect(screen.getByText("You are cleared for surgery!")).toBeInTheDocument();
});

test("renders the subtitle message", () => {
  render(<SurgeryCleared />);
  expect(screen.getByText(/pre-operative conditions have been met/i)).toBeInTheDocument();
});

test("has alert role for accessibility", () => {
  render(<SurgeryCleared />);
  expect(screen.getByRole("alert")).toBeInTheDocument();
});
