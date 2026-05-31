// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~100%
// AI-Assisted Areas: Test structure, describe/test blocks, setup, and assertions
// Human Contributions: Prompted and reviewed all generated tests (PR #13 author);
//   updated mock target from @prisma/client to ../config/prisma (integration by team lead)

const request = require('supertest');
const express = require('express');

// Mock the shared prisma instance used by our patients.js
const mockFindMany = jest.fn();

jest.mock('../config/prisma', () => ({
  patient: { findMany: mockFindMany },
}));

// Bypass auth so tests focus on route/search logic, not Firebase
jest.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next(),
}));

const patientRouter = require('../routes/patients');

const app = express();
app.use(express.json());
app.use('/api/patients', patientRouter);

const makePatient = (overrides = {}) => ({
  id: 1,
  mrn: 'MRN001',
  name: 'Test Patient',
  dateOfBirth: new Date('1985-01-01'),
  bmi: 28.5,
  visitType: 'Obesity Medicine Specialist',
  insurance: 'not clear',
  labs: 'not complete',
  consult: 'not complete',
  dietitian: 'not complete',
  psychologist: 'not complete',
  endoscopy: 'not required',
  cardiology: 'not required',
  sleep: 'not required',
  barium: 'not required',
  hematology: 'not required',
  createdAt: new Date(),
  ...overrides,
});

describe('GET /api/patients', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  describe('response format', () => {
    test('returns 200 with an array', async () => {
      mockFindMany.mockResolvedValue([makePatient()]);
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('each patient includes mrn, name, bmi, visitType, insurance, and progress', async () => {
      mockFindMany.mockResolvedValue([makePatient()]);
      const res = await request(app).get('/api/patients');
      const patient = res.body[0];
      expect(patient).toHaveProperty('mrn');
      expect(patient).toHaveProperty('name');
      expect(patient).toHaveProperty('bmi');
      expect(patient).toHaveProperty('visitType');
      expect(patient).toHaveProperty('insurance');
      expect(patient).toHaveProperty('progress');
    });

    test('progress field has completed and total properties', async () => {
      mockFindMany.mockResolvedValue([makePatient()]);
      const res = await request(app).get('/api/patients');
      const { progress } = res.body[0];
      expect(typeof progress.completed).toBe('number');
      expect(typeof progress.total).toBe('number');
    });

    test('returns 200 with an empty array when no patients exist', async () => {
      mockFindMany.mockResolvedValue([]);
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 500 with an error message when the database throws', async () => {
      mockFindMany.mockRejectedValue(new Error('Connection refused'));
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('progress computation', () => {
    test('computes correct progress for Obesity Medicine Specialist (2 of 5 done)', async () => {
      mockFindMany.mockResolvedValue([makePatient({ insurance: 'clear', labs: 'complete', consult: 'in progress' })]);
      const res = await request(app).get('/api/patients');
      expect(res.body[0].progress).toEqual({ completed: 2, total: 5 });
    });

    test('computes correct progress for Endoscopic Obesity Specialist (3 of 7 done)', async () => {
      mockFindMany.mockResolvedValue([makePatient({
        visitType: 'Endoscopic Obesity Specialist', bmi: 32.0,
        insurance: 'self pay', labs: 'complete', consult: 'complete',
      })]);
      const res = await request(app).get('/api/patients');
      expect(res.body[0].progress).toEqual({ completed: 3, total: 7 });
    });

    test('computes 100% for a fully completed Bariatric Surgeon patient', async () => {
      mockFindMany.mockResolvedValue([makePatient({
        visitType: 'Bariatric Surgeon', bmi: 37.0,
        insurance: 'clear', labs: 'complete', consult: 'complete', dietitian: 'complete',
        psychologist: 'complete', endoscopy: 'complete', cardiology: 'complete',
        sleep: 'complete', barium: 'complete', hematology: 'complete',
      })]);
      const res = await request(app).get('/api/patients');
      expect(res.body[0].progress).toEqual({ completed: 10, total: 10 });
    });

    test('returns { completed: 0, total: 0 } for Not Eligible patient', async () => {
      mockFindMany.mockResolvedValue([makePatient({ visitType: 'Not Eligible', bmi: 26.0 })]);
      const res = await request(app).get('/api/patients');
      expect(res.body[0].progress).toEqual({ completed: 0, total: 0 });
    });
  });

  describe('?search query parameter', () => {
    test('with no search term, Prisma is called with no arguments', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients');
      expect(mockFindMany).toHaveBeenCalledWith();
    });

    test('search term is passed to Prisma as a name/MRN OR clause', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients').query({ search: 'John' });
      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(Array.isArray(whereClause.OR)).toBe(true);
      expect(whereClause.OR.some((c) => c.name?.contains === 'John')).toBe(true);
      expect(whereClause.OR.some((c) => c.mrn?.contains === 'John')).toBe(true);
    });

    test('search term is trimmed before being forwarded to Prisma', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients').query({ search: '  Smith  ' });
      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(whereClause.OR.some((c) => c.name?.contains === 'Smith')).toBe(true);
    });
  });

  describe('?specialistType filter', () => {
    test('filters by visitType in the Prisma where clause', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients').query({ specialistType: 'Bariatric Surgeon' });
      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(whereClause.visitType).toBe('Bariatric Surgeon');
    });
  });

  describe('?insuranceStatus filter', () => {
    test('filters by insurance in the Prisma where clause', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients').query({ insuranceStatus: 'clear' });
      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(whereClause.insurance).toBe('clear');
    });
  });

  describe('combined filters', () => {
    test('applies specialistType and insuranceStatus together', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients').query({ specialistType: 'Bariatric Surgeon', insuranceStatus: 'not clear' });
      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(whereClause.visitType).toBe('Bariatric Surgeon');
      expect(whereClause.insurance).toBe('not clear');
    });

    test('applies search, specialistType, and insuranceStatus together', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients').query({ search: 'Jane', specialistType: 'Endoscopic Obesity Specialist', insuranceStatus: 'self pay' });
      const whereClause = mockFindMany.mock.calls[0][0].where;
      expect(whereClause.visitType).toBe('Endoscopic Obesity Specialist');
      expect(whereClause.insurance).toBe('self pay');
      expect(whereClause.OR.some((c) => c.name?.contains === 'Jane')).toBe(true);
    });
  });
});
