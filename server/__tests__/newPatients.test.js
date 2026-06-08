// server/tests/newPatients.test.js
// TDD tests for BARI-24
// View New Patient Registrations
//
// Coordinator sees new patients
// who need to be called
// Newest patients appear first

const request = require('supertest');
const app     = require('../app');

// Mock Prisma so we do not need
// a real database connection
jest.mock('../config/prisma', () => ({
  patient: {
    findMany: jest.fn(),
    count:    jest.fn(),
  },
}));

// Mock verifyAuth middleware
// so we do not need Firebase
jest.mock('../middleware/verifyAuth',
  () => ({
    verifyAuth: (req, res, next) => {
      req.user = {
        id:   1,
        role: 'COORDINATOR'
      };
      next();
    }
  })
);

const prisma = require('../config/prisma');

// Increase timeout for Docker environment
jest.setTimeout(15000);

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

//-----------------------------------
// BARI-24 New Patient Tests
// --------------------------------

describe('GET /api/patients', () => {

  // --------TEST 1 -----------------
  // Returns all patients with
  // newest first
  it('should return all patients ordered by newest registration first', async () => {

    // Arrange
    const mockPatients = [
      {
        id:          3,
        name:        'New Patient',
        mrn:         'MRN-003',
        bmi:         33.5,
        visitType:   'Endoscopic Obesity Specialist',
        insurance:   'not clear',
        consult:     'not complete',
        labs:        'not complete',
        dietitian:   'not required',
        psychologist:'not required',
        endoscopy:   'not required',
        cardiology:  'not required',
        hematology:  'not required',
        nephrology:  'not required',
        barium:      'not required',
        colonoscopy: 'not required',
        sleep:       'not required',
        createdAt:   new Date('2026-05-30'),
      },
      {
        id:          1,
        name:        'Old Patient',
        mrn:         'MRN-001',
        bmi:         28.5,
        visitType:   'Obesity Medicine Specialist',
        insurance:   'clear',
        consult:     'complete',
        labs:        'complete',
        dietitian:   'complete',
        psychologist:'complete',
        endoscopy:   'not required',
        cardiology:  'not required',
        hematology:  'not required',
        nephrology:  'not required',
        barium:      'not required',
        colonoscopy: 'not required',
        sleep:       'not required',
        createdAt:   new Date('2026-05-14'),
      },
    ];

    prisma.patient.findMany
      .mockResolvedValue(mockPatients);

    // Act
    const response = await request(app)
      .get('/api/patients');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);

    // Newest patient should be first
    expect(response.body[0].name)
      .toBe('New Patient');
    expect(response.body[1].name)
      .toBe('Old Patient');
  });

  // ------------ TEST 2 ----------------------
  // Each patient includes progress
  it('should include progress calculation for each patient', async () => {

    const mockPatients = [
      {
        id:          1,
        name:        'Jane Doe',
        mrn:         'MRN-001',
        bmi:         33.5,
        visitType:   'Endoscopic Obesity Specialist',
        insurance:   'clear',
        consult:     'complete',
        labs:        'complete',
        dietitian:   'in progress',
        psychologist:'complete',
        endoscopy:   'ordered',
        cardiology:  'not complete',
        hematology:  'not required',
        nephrology:  'not required',
        barium:      'not required',
        colonoscopy: 'not required',
        sleep:       'not required',
        createdAt:   new Date('2026-05-20'),
      }
    ];

    prisma.patient.findMany
      .mockResolvedValue(mockPatients);

    const response = await request(app)
      .get('/api/patients');

    expect(response.status).toBe(200);

    // Progress should be included
    expect(response.body[0].progress)
      .toBeDefined();

    // Progress should have
    // completed and total
    expect(response.body[0]
      .progress.completed)
      .toBeDefined();
    expect(response.body[0]
      .progress.total)
      .toBeDefined();
  });

  // ----------- TEST 3 ------------------------
  // New patient has correct defaults
  it('should show new patient with default values after registration',
    async () => {

    const newPatient = {
      id:          5,
      name:        'Brand New Patient',
      mrn:         'MRN-005',
      bmi:         37.2,
      visitType:   'Bariatric Surgeon',
      insurance:   'not clear',
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
      createdAt:   new Date('2026-05-30'),
    };

    prisma.patient.findMany
      .mockResolvedValue([newPatient]);

    const response = await request(app)
      .get('/api/patients');

    expect(response.status).toBe(200);

    const patient = response.body[0];

    // New patient has not clear insurance
    expect(patient.insurance)
      .toBe('not clear');

    // New patient has zero progress
    expect(patient.progress.completed)
      .toBe(0);

    // Total should be 10 for
    // Bariatric Surgeon path
    expect(patient.progress.total)
      .toBe(10);
  });

  // -------- TEST 4 ------------------
  // Not eligible patients show N/A
  it('should show N/A progress for not eligible patients',async () => {

    const notEligiblePatient = {
      id:          6,
      name:        'Not Eligible Patient',
      mrn:         'MRN-006',
      bmi:         24.5,
      visitType:   'Not Eligible',
      insurance:   'not clear',
      consult:     'not required',
      labs:        'not required',
      dietitian:   'not required',
      psychologist:'not required',
      endoscopy:   'not required',
      cardiology:  'not required',
      hematology:  'not required',
      nephrology:  'not required',
      barium:      'not required',
      colonoscopy: 'not required',
      sleep:       'not required',
      createdAt:   new Date('2026-05-28'),
    };

    prisma.patient.findMany
      .mockResolvedValue([notEligiblePatient]);

    const response = await request(app)
      .get('/api/patients');

    expect(response.status).toBe(200);

    const patient = response.body[0];

    // Not eligible has 0 total
    // Progress bar shows N/A
    expect(patient.progress.total).toBe(0);
    expect(patient.progress.completed)
      .toBe(0);
  });

  // ----------TEST 5 -------------------
  // Search filter works by name
  it('should filter patients by name when search is provided',async () => {

    const filteredPatients = [
      {
        id:          1,
        name:        'Jane Doe',
        mrn:         'MRN-001',
        bmi:         33.5,
        visitType:   'Endoscopic Obesity Specialist',
        insurance:   'clear',
        consult:     'complete',
        labs:        'complete',
        dietitian:   'complete',
        psychologist:'complete',
        endoscopy:   'complete',
        cardiology:  'complete',
        hematology:  'not required',
        nephrology:  'not required',
        barium:      'not required',
        colonoscopy: 'not required',
        sleep:       'not required',
        createdAt:   new Date('2026-05-20'),
      }
    ];

    prisma.patient.findMany
      .mockResolvedValue(filteredPatients);

    const response = await request(app)
      .get('/api/patients?search=Jane');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name)
      .toBe('Jane Doe');
  });

  // ---------- TEST 6 ----------------
  // Returns empty array when
  // no patients match
  it('should return empty array when no patients match the search',async () => {

    prisma.patient.findMany
      .mockResolvedValue([]);

    const response = await request(app)
      .get('/api/patients?search=nobody');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
    expect(Array.isArray(response.body))
      .toBe(true);
  });

  // ---------- TEST 7 ----------------------
  // Returns 500 on server error
  it('should return 500 when database throws an error',async () => {

    prisma.patient.findMany
      .mockRejectedValue(
        new Error('Database connection failed')
      );

    const response = await request(app)
      .get('/api/patients');

    expect(response.status).toBe(500);
    expect(response.body.error)
      .toBeDefined();
  });

});