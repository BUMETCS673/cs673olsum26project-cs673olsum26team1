import { calculateBMI } from "../src/utils/bmi";

test("calculates BMI correctly", () => {
  expect(calculateBMI(65, 150)).toBeCloseTo(24.96, 2);
});

test("returns null for invalid height", () => {
  expect(calculateBMI(0, 150)).toBeNull();
});