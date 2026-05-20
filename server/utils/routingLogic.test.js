const { getSpecialistRecommendation } = require('./routingLogic');

describe('getSpecialistRecommendation', () => {
  test('returns Bariatric surgeon with no alternative if previous surgery is "yes"', () => {
    const result = getSpecialistRecommendation(25, 'yes');
    expect(result).toEqual({
      primary: 'Bariatric surgeon',
      alternative: null
    });
  });

  test('returns Bariatric surgeon with no alternative if previous surgery is true (boolean)', () => {
    const result = getSpecialistRecommendation(40, true);
    expect(result).toEqual({
      primary: 'Bariatric surgeon',
      alternative: null
    });
  });

  test('returns Not eligible for BMI below 27 with no previous surgery', () => {
    const result = getSpecialistRecommendation(26.9, 'no');
    expect(result).toEqual({
      primary: 'Not eligible',
      alternative: null
    });
  });

  test('returns Obesity medicine specialist for BMI 27 to 29.9', () => {
    const result = getSpecialistRecommendation(28.5, 'no');
    expect(result).toEqual({
      primary: 'Obesity medicine specialist',
      alternative: 'Endoscopic obesity specialist'
    });
  });

  test('returns Endoscopic obesity specialist for BMI 30 to 34.9', () => {
    const result = getSpecialistRecommendation(32, 'no');
    expect(result).toEqual({
      primary: 'Endoscopic obesity specialist',
      alternative: 'Obesity medicine specialist'
    });
  });

  test('returns Bariatric surgeon for BMI 35 or above', () => {
    const result = getSpecialistRecommendation(35.1, 'no');
    expect(result).toEqual({
      primary: 'Bariatric surgeon',
      alternative: 'Endoscopic obesity specialist'
    });
  });

  test('handles string BMI inputs correctly', () => {
    const result = getSpecialistRecommendation('31.5', 'no');
    expect(result).toEqual({
      primary: 'Endoscopic obesity specialist',
      alternative: 'Obesity medicine specialist'
    });
  });
});
