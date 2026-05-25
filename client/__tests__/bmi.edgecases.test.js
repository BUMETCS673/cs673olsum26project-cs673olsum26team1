// If you already have a utility function, import it:
import { calculateBMI } from "../src/utils/bmi";

describe("BMI Calculation Edge Cases", () => {

  // ---------------------------
  // 1. Invalid / missing height
  // ---------------------------
  test("returns null when height is 0", () => {
    expect(calculateBMI(0, 150)).toBeNull();
  });

  test("returns null when height is negative", () => {
    expect(calculateBMI(-10, 150)).toBeNull();
  });

  test("returns null when height is undefined", () => {
    expect(calculateBMI(undefined, 150)).toBeNull();
  });

  test("returns null when height is empty string", () => {
    expect(calculateBMI("", 150)).toBeNull();
  });

  // ---------------------------
  // 2. Invalid / missing weight
  // ---------------------------
  test("handles zero weight correctly", () => {
    expect(calculateBMI(65, 0)).toBe(0);
  });

  test("handles negative weight", () => {
    const bmi = calculateBMI(65, -150);
    expect(bmi).toBeLessThan(0);
  });

  test("handles undefined weight", () => {
    expect(calculateBMI(65, undefined)).toBeNaN();
  });

  // ---------------------------
  // 3. String inputs (VERY common bug in React forms)
  // ---------------------------
  test("handles numeric strings", () => {
    const bmi = calculateBMI("65", "150");
    expect(bmi).toBeCloseTo(24.96, 2);
  });

  test("handles strings with spaces", () => {
    const bmi = calculateBMI(" 65 ", " 150 ");
    expect(bmi).toBeCloseTo(24.96, 2);
  });

  test("returns NaN for non-numeric strings", () => {
    expect(calculateBMI("abc", "xyz")).toBeNaN();
  });

  // ---------------------------
  // 4. Extreme values
  // ---------------------------
  test("handles very small height (edge risk of large BMI)", () => {
    const bmi = calculateBMI(1, 150);
    expect(bmi).toBeGreaterThan(10000);
  });

  test("handles very large values", () => {
    const bmi = calculateBMI(100, 1000);
    expect(bmi).toBeCloseTo(70.3, 2);
  });

  // ---------------------------
  // 5. Division safety
  // ---------------------------
  test("does not crash when both inputs are zero", () => {
    expect(() => calculateBMI(0, 0)).not.toThrow();
  });

});