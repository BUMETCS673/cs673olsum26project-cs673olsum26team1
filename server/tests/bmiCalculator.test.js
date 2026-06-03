const { calculateBMI } = require('../utils/bmiCalculator');

describe('BMI Calculator Utilities', () => {
  describe('calculateBMI()', () => {
    
    it('should correctly calculate a normal BMI', () => {
      // Setup
      const weight = 150; // lbs
      const height = 70;  // inches (5'10")
      // Expected BMI: (150 / (70 * 70)) * 703 = 21.5204... -> 21.5
      
      // Execute
      const result = calculateBMI(weight, height);
      
      // Assert
      expect(result).toBe(21.5);
    });

    it('should correctly calculate an overweight BMI', () => {
      const weight = 200; // lbs
      const height = 68;  // inches (5'8")
      // Expected BMI: (200 / (68 * 68)) * 703 = 30.406... -> 30.4
      
      const result = calculateBMI(weight, height);
      
      expect(result).toBe(30.4);
    });

    it('should handle zero or negative inputs gracefully (edge cases)', () => {
      // By our design, invalid inputs should throw an error or return null.
      // Let's expect it to throw an error for invalid input.
      expect(() => {
        calculateBMI(0, 70);
      }).toThrow('Weight and height must be positive numbers');
      
      expect(() => {
        calculateBMI(150, -5);
      }).toThrow('Weight and height must be positive numbers');
    });

  });
});
