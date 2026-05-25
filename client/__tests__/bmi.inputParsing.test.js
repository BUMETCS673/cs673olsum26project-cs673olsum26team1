import { calculateBMI } from "../src/utils/bmi";

describe("BMI Input Parsing", () => {

  test("handles numeric string inputs", () => {
    const bmi = calculateBMI("65", "150");
    expect(bmi).toBeCloseTo(24.96, 2);
  });

  test("handles numeric strings with spaces", () => {
    const bmi = calculateBMI(" 65 ", " 150 ");
    expect(bmi).toBeCloseTo(24.96, 2);
  });

  test("handles mixed numeric and string inputs", () => {
    const bmi = calculateBMI("65", 150);
    expect(bmi).toBeCloseTo(24.96, 2);
  });

  test("returns NaN or invalid for non-numeric strings", () => {
    const bmi = calculateBMI("abc", "xyz");
    expect(Number.isNaN(bmi)).toBe(true);
  });

  test("handles empty string inputs safely", () => {
    const bmi = calculateBMI("", "");
    expect(bmi === null || Number.isNaN(bmi)).toBe(true);
  });

  test("does not crash on undefined inputs", () => {
    expect(() => calculateBMI(undefined, undefined)).not.toThrow();
  });

});