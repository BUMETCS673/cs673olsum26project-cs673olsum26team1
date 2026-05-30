// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~95%
// AI-Assisted Areas: Generation of unit tests
// Human Contributions: I prompted and reviewed all of the generated tests to ensure they accurately reflect the business logic and requirements. 
// Notes: I'm not very familair with Jest, so this was a good opportunity to learn more about unit tests in Jest. 

const { computeProgress } = require('../searchDB/calculateProgress');

// ---------------------------------------------------------------------------
// Helpers – build minimal patient objects for each specialist type
// ---------------------------------------------------------------------------

const obesityMedicinePatient = (overrides = {}) => ({
  visitType: 'Obesity Medicine Specialist',
  insurance: 'not clear',
  labs: 'not complete',
  consult: 'not complete',
  dietitian: 'not complete',
  psychologist: 'not complete',
  ...overrides,
});

const endoscopicPatient = (overrides = {}) => ({
  visitType: 'Endoscopic Obesity Specialist',
  insurance: 'not clear',
  labs: 'not complete',
  consult: 'not complete',
  dietitian: 'not complete',
  psychologist: 'not complete',
  endoscopy: 'not complete',
  cardiology: 'not complete',
  ...overrides,
});

const bariatricPatient = (overrides = {}) => ({
  visitType: 'Bariatric Surgeon',
  insurance: 'not clear',
  labs: 'not complete',
  consult: 'not complete',
  dietitian: 'not complete',
  psychologist: 'not complete',
  endoscopy: 'not complete',
  cardiology: 'not complete',
  sleep: 'not complete',
  barium: 'not complete',
  hematology: 'not complete',
  ...overrides,
});

// ---------------------------------------------------------------------------

describe('computeProgress', () => {

  // -------------------------------------------------------------------------
  // Obesity Medicine Specialist — 5 required items
  // -------------------------------------------------------------------------
  describe('Obesity Medicine Specialist (5 required items)', () => {
    test('returns total of 5', () => {
      const { total } = computeProgress(obesityMedicinePatient());
      expect(total).toBe(5);
    });

    test('returns completed: 0 when no items are complete', () => {
      const { completed } = computeProgress(obesityMedicinePatient());
      expect(completed).toBe(0);
    });

    test('returns completed: 5 when all items are complete', () => {
      const patient = obesityMedicinePatient({
        insurance: 'clear',
        labs: 'complete',
        consult: 'complete',
        dietitian: 'complete',
        psychologist: 'complete',
      });
      expect(computeProgress(patient)).toEqual({ completed: 5, total: 5 });
    });

    test('returns correct count for a partially complete patient', () => {
      const patient = obesityMedicinePatient({
        insurance: 'clear',   // complete
        labs: 'complete',     // complete
        consult: 'ordered',   // not complete
      });
      expect(computeProgress(patient)).toEqual({ completed: 2, total: 5 });
    });
  });

  // -------------------------------------------------------------------------
  // Endoscopic Obesity Specialist — 7 required items
  // -------------------------------------------------------------------------
  describe('Endoscopic Obesity Specialist (7 required items)', () => {
    test('returns total of 7', () => {
      const { total } = computeProgress(endoscopicPatient());
      expect(total).toBe(7);
    });

    test('returns completed: 0 when no items are complete', () => {
      const { completed } = computeProgress(endoscopicPatient());
      expect(completed).toBe(0);
    });

    test('returns completed: 7 when all items are complete', () => {
      const patient = endoscopicPatient({
        insurance: 'self pay',
        labs: 'complete',
        consult: 'complete',
        dietitian: 'complete',
        psychologist: 'complete',
        endoscopy: 'complete',
        cardiology: 'complete',
      });
      expect(computeProgress(patient)).toEqual({ completed: 7, total: 7 });
    });

    test('returns correct count for a partially complete patient', () => {
      const patient = endoscopicPatient({
        insurance: 'clear',    // complete
        labs: 'complete',      // complete
        consult: 'complete',   // complete
        endoscopy: 'in progress', // not complete
      });
      expect(computeProgress(patient)).toEqual({ completed: 3, total: 7 });
    });
  });

  // -------------------------------------------------------------------------
  // Bariatric Surgeon — 10 required items
  // -------------------------------------------------------------------------
  describe('Bariatric Surgeon (10 required items)', () => {
    test('returns total of 10', () => {
      const { total } = computeProgress(bariatricPatient());
      expect(total).toBe(10);
    });

    test('returns completed: 0 when no items are complete', () => {
      const { completed } = computeProgress(bariatricPatient());
      expect(completed).toBe(0);
    });

    test('returns completed: 10 when all items are complete', () => {
      const patient = bariatricPatient({
        insurance: 'clear',
        labs: 'complete',
        consult: 'complete',
        dietitian: 'complete',
        psychologist: 'complete',
        endoscopy: 'complete',
        cardiology: 'complete',
        sleep: 'complete',
        barium: 'complete',
        hematology: 'complete',
      });
      expect(computeProgress(patient)).toEqual({ completed: 10, total: 10 });
    });

    test('returns correct count for a partially complete patient', () => {
      const patient = bariatricPatient({
        insurance: 'self pay',  // complete
        labs: 'complete',       // complete
        consult: 'complete',    // complete
        sleep: 'ordered',       // not complete
        barium: 'in progress',  // not complete
      });
      expect(computeProgress(patient)).toEqual({ completed: 3, total: 10 });
    });
  });

  // -------------------------------------------------------------------------
  // Insurance field — special completion logic
  // -------------------------------------------------------------------------
  describe('insurance field completion logic', () => {
    test('"clear" counts as complete', () => {
      const patient = obesityMedicinePatient({ insurance: 'clear' });
      const { completed } = computeProgress(patient);
      expect(completed).toBe(1);
    });

    test('"self pay" counts as complete', () => {
      const patient = obesityMedicinePatient({ insurance: 'self pay' });
      const { completed } = computeProgress(patient);
      expect(completed).toBe(1);
    });

    test('"not clear" does not count as complete', () => {
      const patient = obesityMedicinePatient({ insurance: 'not clear' });
      const { completed } = computeProgress(patient);
      expect(completed).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Non-complete checklist statuses
  // -------------------------------------------------------------------------
  describe('non-complete checklist item statuses', () => {
    const statusCases = ['not complete', 'ordered', 'in progress', 'not required'];

    test.each(statusCases)('"%s" does not count as complete', (status) => {
      const patient = obesityMedicinePatient({ labs: status });
      const { completed } = computeProgress(patient);
      expect(completed).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    test('returns { completed: 0, total: 0 } for an empty patient object', () => {
      expect(computeProgress({})).toEqual({ completed: 0, total: 0 });
    });

    test('returns { completed: 0, total: 0 } when visitType is undefined', () => {
      expect(computeProgress({ visitType: undefined })).toEqual({ completed: 0, total: 0 });
    });

    test('returns { completed: 0, total: 0 } when visitType is null', () => {
      expect(computeProgress({ visitType: null })).toEqual({ completed: 0, total: 0 });
    });

    test('returns { completed: 0, total: 0 } for an unrecognised visitType', () => {
      expect(computeProgress({ visitType: 'Unknown Specialist' })).toEqual({ completed: 0, total: 0 });
    });

    test('returns { completed: 0, total: 0 } for "Not Eligible" visitType', () => {
      expect(computeProgress({ visitType: 'Not Eligible' })).toEqual({ completed: 0, total: 0 });
    });

    test('does not count fields that belong to a higher specialist tier', () => {
      // Obesity Medicine only requires 5 items; endoscopy/cardiology are irrelevant
      const patient = obesityMedicinePatient({
        endoscopy: 'complete',
        cardiology: 'complete',
      });
      expect(computeProgress(patient)).toEqual({ completed: 0, total: 5 });
    });
  });
});
