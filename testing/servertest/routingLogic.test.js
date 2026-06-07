const { getSpecialistRecommendation } = require('../../code/server/utils/routingLogic');

describe('getSpecialistRecommendation', () => {
  test('returns Bariatric surgeon with no alternative if previous surgery is "yes"', () => {
    expect(getSpecialistRecommendation(25, 'yes')).toEqual({ primary: 'Bariatric surgeon', alternative: null });
  });

  test('returns Bariatric surgeon with no alternative if previous surgery is true (boolean)', () => {
    expect(getSpecialistRecommendation(40, true)).toEqual({ primary: 'Bariatric surgeon', alternative: null });
  });

  test('returns Not eligible for BMI below 27 with no previous surgery', () => {
    expect(getSpecialistRecommendation(26.9, 'no')).toEqual({ primary: 'Not eligible', alternative: null });
  });

  test('returns Obesity medicine specialist for BMI 27 to 29.9', () => {
    expect(getSpecialistRecommendation(28.5, 'no')).toEqual({
      primary: 'Obesity medicine specialist',
      alternative: 'Endoscopic obesity specialist',
    });
  });

  test('returns Endoscopic obesity specialist for BMI 30 to 34.9', () => {
    expect(getSpecialistRecommendation(32, 'no')).toEqual({
      primary: 'Endoscopic obesity specialist',
      alternative: 'Obesity medicine specialist',
    });
  });

  test('returns Bariatric surgeon for BMI 35 or above', () => {
    expect(getSpecialistRecommendation(35.1, 'no')).toEqual({
      primary: 'Bariatric surgeon',
      alternative: 'Endoscopic obesity specialist',
    });
  });

  test('handles string BMI inputs correctly', () => {
    expect(getSpecialistRecommendation('31.5', 'no')).toEqual({
      primary: 'Endoscopic obesity specialist',
      alternative: 'Obesity medicine specialist',
    });
  });

  test('boundary: exactly BMI 27', () => {
    expect(getSpecialistRecommendation(27, 'no')).toEqual({
      primary: 'Obesity medicine specialist',
      alternative: 'Endoscopic obesity specialist',
    });
  });

  test('boundary: exactly BMI 35', () => {
    expect(getSpecialistRecommendation(35, 'no')).toEqual({
      primary: 'Bariatric surgeon',
      alternative: 'Endoscopic obesity specialist',
    });
  });

  test('boundary: upper BMI 40', () => {
    expect(getSpecialistRecommendation(40, 'no')).toEqual({
      primary: 'Bariatric surgeon',
      alternative: 'Endoscopic obesity specialist',
    });
  });
});
