/**
 * Calculates the recommended specialist based on BMI and previous surgery.
 *
 * @param {number|string} bmi 
 * @param {string|boolean} previousSurgery - 'yes', 'no', true, or false
 * @returns {object} { primary: string, alternative: string | null }
 */
function getSpecialistRecommendation(bmi, previousSurgery) {
  const hasPreviousSurgery = previousSurgery === 'yes' || previousSurgery === true;

  if (hasPreviousSurgery) {
    return {
      primary: 'Bariatric surgeon',
      alternative: null
    };
  }

  const numBmi = parseFloat(bmi);
  if (isNaN(numBmi) || numBmi < 27) {
    return {
      primary: 'Not eligible',
      alternative: null
    };
  }

  if (numBmi >= 35) {
    return {
      primary: 'Bariatric surgeon',
      alternative: 'Endoscopic obesity specialist'
    };
  }

  if (numBmi >= 30) {
    return {
      primary: 'Endoscopic obesity specialist',
      alternative: 'Obesity medicine specialist'
    };
  }

  // BMI 27 to 29.9
  return {
    primary: 'Obesity medicine specialist',
    alternative: 'Endoscopic obesity specialist'
  };
}

module.exports = { getSpecialistRecommendation };
