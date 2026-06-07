/**
 * Calculates Body Mass Index (BMI)
 * Formula: (weight in lbs / (height in inches * height in inches)) * 703
 *
 * @param {number} weightLbs - The patient's weight in pounds
 * @param {number} heightInches - The patient's height in inches
 * @returns {number} The calculated BMI, rounded to one decimal place
 */
function calculateBMI(weightLbs, heightInches) {
  if (weightLbs <= 0 || heightInches <= 0) {
    throw new Error('Weight and height must be positive numbers');
  }

  const bmi = (weightLbs / (heightInches * heightInches)) * 703;
  
  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
}

module.exports = { calculateBMI };
