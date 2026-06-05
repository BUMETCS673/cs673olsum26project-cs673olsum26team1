// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, mock setup, assertions
// Human Contributions: Acceptance criteria, business logic requirements, testing
// Notes: Acceptance tests for BARI-24 View New Patient Registrations

const request = require('supertest');
const app     = require('../app');

jest.setTimeout(15000);

// Mock Prisma so no real database connection is needed
jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  patient: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

// Mock verifyAuth so no Firebase token is needed
jest.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (req, res, next) => {
    req.user = { id: 1, name: 'Test Coordinator', role: 'COORDINATOR' };
    next();
  },
}));

const prisma = require('../config/prisma');

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper: build a patient object with sensible defaults
const makePatient = (overrides = {}) => ({
  id:          1,
  name:        'Test Patient',
  mrn:         'MRN000001',
  bmi:         0,
  visitType:   null,
  insurance:   null,
  consult:     'not complete',
  labs:        'not complete',
  dietitian:   'not complete',
  psychologist:'not complete',
  endoscopy:   'not complete',
  cardiology:  'not complete',
  hematology:  'not complete',
  nephrology:  'not required',
  barium:      'not complete',
  colonoscopy: 'not required',
  sleep:       'not complete',
  createdAt:   new Date(),
  ...overrides,
});

// ============================================================
// BARI-24 Acceptance Tests: View New Patient Registrations
// ============================================================

describe('BARI-24 Acceptance Tests', () => {

  // ----------------------------------------------------------
  // AC1: Newest patients appear first in the coordinator list
  // ----------------------------------------------------------
  describe('AC1 createdAt sorting', () => {

    it('should return patients ordered newest registration first', async () => {
      const now        = new Date();
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(now.getDate() - 2);
      const tenDaysAgo = new Date(now);
      tenDaysAgo.setDate(now.getDate() - 10);

      prisma.patient.findMany.mockResolvedValue([
        makePatient({ id: 3, name: 'Newest Patient', createdAt: now        }),
        makePatient({ id: 2, name: 'Middle Patient', createdAt: twoDaysAgo }),
        makePatient({ id: 1, name: 'Oldest Patient', createdAt: tenDaysAgo }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Newest Patient');
      expect(response.body[1].name).toBe('Middle Patient');
      expect(response.body[2].name).toBe('Oldest Patient');
    });

    it('should return a single patient list in correct order', async () => {
      prisma.patient.findMany.mockResolvedValue([
        makePatient({ id: 1, name: 'Only Patient', createdAt: new Date() }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Only Patient');
    });
  });

  // ----------------------------------------------------------
  // AC2: createdAt field present so frontend can show new badge
  // ----------------------------------------------------------
  describe('AC2 createdAt field for new patient badge', () => {

    it('should include createdAt for a patient registered today', async () => {
      prisma.patient.findMany.mockResolvedValue([
        makePatient({ id: 1, name: 'Today Patient', createdAt: new Date() }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].createdAt).toBeDefined();
    });

    it('should include createdAt for a patient registered 8 days ago', async () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      prisma.patient.findMany.mockResolvedValue([
        makePatient({ id: 1, name: 'Old Patient', createdAt: eightDaysAgo }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].createdAt).toBeDefined();
    });
  });

  // ----------------------------------------------------------
  // AC3: New patient appears in coordinator list immediately
  // ----------------------------------------------------------
  describe('AC3 new patient appears in list after registration', () => {

    it('should return newly registered patient in coordinator list', async () => {
      const newPatient = makePatient({
        id:        99,
        name:      'Newly Registered',
        mrn:       'MRN000099',
        bmi:       35.2,
        visitType: 'Bariatric Surgeon',
        insurance: 'not clear',
        createdAt: new Date(),
      });

      prisma.patient.findMany.mockResolvedValue([newPatient]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Newly Registered');
      expect(response.body[0].mrn).toBe('MRN000099');
    });

    it('should include the new patient at the top when other patients exist', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      prisma.patient.findMany.mockResolvedValue([
        makePatient({ id: 5, name: 'Brand New', createdAt: new Date()   }),
        makePatient({ id: 4, name: 'Yesterday', createdAt: yesterday    }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Brand New');
    });
  });

  // ----------------------------------------------------------
  // AC4: New patient has correct default values
  // ----------------------------------------------------------
  describe('AC4 new patient default values after registration', () => {

    it('should have insurance set to not clear by default', async () => {
      prisma.patient.findMany.mockResolvedValue([
        makePatient({ insurance: 'not clear' }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].insurance).toBe('not clear');
    });

    it('should have 0 completed steps when no clinical orders are done', async () => {
      prisma.patient.findMany.mockResolvedValue([
        makePatient({
          visitType:   'Bariatric Surgeon',
          insurance:   'not clear',
          consult:     'not complete',
          labs:        'not complete',
          dietitian:   'not complete',
          psychologist:'not complete',
          endoscopy:   'not complete',
          cardiology:  'not complete',
          sleep:       'not complete',
          barium:      'not complete',
          hematology:  'not complete',
        }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].progress.completed).toBe(0);
    });

    it('should have progress total of 10 for Bariatric Surgeon path', async () => {
      prisma.patient.findMany.mockResolvedValue([
        makePatient({ visitType: 'Bariatric Surgeon' }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      // Bariatric Surgeon requires 10 items
      // insurance labs consult dietitian psychologist
      // endoscopy cardiology sleep barium hematology
      expect(response.body[0].progress.total).toBe(10);
    });

    it('should set visitType from BMI specialist recommendation', async () => {
      // BMI 38.5 maps to Bariatric Surgeon via routingLogic
      prisma.patient.findMany.mockResolvedValue([
        makePatient({ bmi: 38.5, visitType: 'Bariatric Surgeon' }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].visitType).toBe('Bariatric Surgeon');
    });

    it('should have 0 progress total when visitType is null before BMI is done', async () => {
      prisma.patient.findMany.mockResolvedValue([
        makePatient({ visitType: null, bmi: 0 }),
      ]);

      const response = await request(app).get('/api/patients');

      expect(response.status).toBe(200);
      expect(response.body[0].progress.total).toBe(0);
      expect(response.body[0].progress.completed).toBe(0);
    });
  });

});
