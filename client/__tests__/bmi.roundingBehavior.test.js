import { calculateBMI } from "../src/utils/bmi";

describe("BMI Rounding Behavior", () => {

  test("returns a number (not string)", () => {
    const bmi = calculateBMI(65, 150);
    expect(typeof bmi).toBe("number");
  });

  test("does not truncate to integer", () => {
    const bmi = calculateBMI(65, 150);
    expect(bmi).not.toBe(24);
  });

  test("maintains decimal precision", () => {
    const bmi = calculateBMI(65, 150);
    expect(bmi.toString()).toContain(".");
  });

  test("repeated calls return consistent results", () => {
    const bmi1 = calculateBMI(65, 150);
    const bmi2 = calculateBMI(65, 150);

    expect(bmi1).toBeCloseTo(bmi2, 10);
  });

  test("matches expected precision for typical values", () => {
    const bmi = calculateBMI(67, 154);
    expect(bmi).toBeCloseTo(24.12, 2);
  });

  test("high precision values behave consistently", () => {
    const bmi = calculateBMI(100, 1000);
    expect(bmi).toBeCloseTo(70.3, 1);
  });

});