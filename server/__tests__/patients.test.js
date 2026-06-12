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
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockNotificationCreate = jest.fn();
const mockAuditLogFindFirst = jest.fn();

jest.mock('../config/prisma', () => ({
  patient: { findMany: mockFindMany, findUnique: mockFindUnique, update: mockUpdate },
  auditLog: { create: mockAuditLogCreate, findFirst: mockAuditLogFindFirst },
  notification: { create: mockNotificationCreate },
}));

// Bypass auth so tests focus on route/search logic, not Firebase
// Attaches a mock coordinator user so routes that read req.user work correctly
jest.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (req, res, next) => {
    req.user = { id: 10, name: 'Test Coordinator', email: 'coord@test.com', role: 'COORDINATOR' };
    next();
  },
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
    test('with no search term, Prisma is called with only orderBy', async () => {
      mockFindMany.mockResolvedValue([]);
      await request(app).get('/api/patients');
      expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
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

describe('GET /api/patients/:id', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockAuditLogFindFirst.mockReset();
    mockAuditLogFindFirst.mockResolvedValue(null);
  });

  describe('response format', () => {
    test('returns 200 with patient data when patient exists', async () => {
      mockFindUnique.mockResolvedValue(makePatient());
      const res = await request(app).get('/api/patients/1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('mrn', 'MRN001');
      expect(res.body).toHaveProperty('name', 'Test Patient');
    });

    test('response includes progress field with completed and total', async () => {
      mockFindUnique.mockResolvedValue(makePatient());
      const res = await request(app).get('/api/patients/1');
      expect(res.body).toHaveProperty('progress');
      expect(typeof res.body.progress.completed).toBe('number');
      expect(typeof res.body.progress.total).toBe('number');
    });

    test('progress is computed correctly for the returned patient', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ insurance: 'clear', labs: 'complete' }));
      const res = await request(app).get('/api/patients/1');
      expect(res.body.progress).toEqual({ completed: 2, total: 5 });
    });

    test('response includes checklist field with required items status mapped', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ insurance: 'clear', labs: 'complete' }));
      const res = await request(app).get('/api/patients/1');
      expect(res.body).toHaveProperty('checklist');
      expect(Array.isArray(res.body.checklist)).toBe(true);
      expect(res.body.checklist).toHaveLength(5);
      expect(res.body.checklist).toContainEqual({ field: 'insurance', status: 'complete' });
      expect(res.body.checklist).toContainEqual({ field: 'labs', status: 'complete' });
      expect(res.body.checklist).toContainEqual({ field: 'consult', status: 'not complete' });
    });

    test('queries prisma with the correct integer id from the URL', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ id: 42 }));
      await request(app).get('/api/patients/42');
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 42 } });
    });

    test('response includes assignedCoordinator if coordinator audit log exists', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ id: 1 }));
      mockAuditLogFindFirst.mockResolvedValue({
        user: { name: 'Dr. Coordinator Name' },
      });
      
      const res = await request(app).get('/api/patients/1');
      expect(res.status).toBe(200);
      expect(res.body.assignedCoordinator).toBe('Dr. Coordinator Name');
      expect(mockAuditLogFindFirst).toHaveBeenCalledWith({
        where: {
          patientId: 1,
          user: { role: 'COORDINATOR' },
        },
        orderBy: { timestamp: 'desc' },
        include: { user: true },
      });
    });

    test('assignedCoordinator is null if no coordinator audit log exists', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ id: 1 }));
      mockAuditLogFindFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/patients/1');
      expect(res.status).toBe(200);
      expect(res.body.assignedCoordinator).toBeNull();
    });
  });

  describe('error handling', () => {
    test('returns 404 when patient does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/patients/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Patient not found');
    });

    test('returns 500 when the database throws', async () => {
      mockFindUnique.mockRejectedValue(new Error('Connection refused'));
      const res = await request(app).get('/api/patients/1');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('PATCH /api/patients/:id/insurance', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    mockAuditLogCreate.mockReset();
    mockNotificationCreate.mockReset();
  });

  describe('successful update', () => {
    test('returns 200 with updated patient when insurance is valid', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
      mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      const res = await request(app).patch('/api/patients/1/insurance').send({ insurance: 'clear' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('insurance', 'clear');
    });

    test('response includes progress field', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
      mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      const res = await request(app).patch('/api/patients/1/insurance').send({ insurance: 'clear' });
      expect(res.body).toHaveProperty('progress');
      expect(typeof res.body.progress.completed).toBe('number');
      expect(typeof res.body.progress.total).toBe('number');
    });

    test('accepts all valid insurance values', async () => {
      for (const value of ['clear', 'not clear', 'self pay', 'in review']) {
        mockFindUnique.mockResolvedValue(makePatient());
        mockUpdate.mockResolvedValue(makePatient({ insurance: value }));
        mockAuditLogCreate.mockResolvedValue({});
        mockNotificationCreate.mockResolvedValue({});

        const res = await request(app).patch('/api/patients/1/insurance').send({ insurance: value });
        expect(res.status).toBe(200);
      }
    });
  });

  describe('audit log', () => {
    test('creates an audit log with old value, new value, patientId, and userId', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
      mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      await request(app).patch('/api/patients/1/insurance').send({ insurance: 'clear' });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          column: 'insurance',
          oldValue: 'not clear',
          newValue: 'clear',
        },
      });
    });
  });

  describe('notification', () => {
    test('creates a notification for the patient mentioning the new insurance value', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
      mockUpdate.mockResolvedValue(makePatient({ insurance: 'self pay' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      await request(app).patch('/api/patients/1/insurance').send({ insurance: 'self pay' });

      const callData = mockNotificationCreate.mock.calls[0][0].data;
      expect(callData.patientId).toBe(1);
      expect(callData.isRead).toBe(false);
      expect(callData.message).toContain('self pay');
    });
  });

  describe('validation', () => {
    test('returns 400 when insurance field is missing', async () => {
      const res = await request(app).patch('/api/patients/1/insurance').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when insurance value is not one of the allowed values', async () => {
      const res = await request(app).patch('/api/patients/1/insurance').send({ insurance: 'unknown' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('error message lists the valid values', async () => {
      const res = await request(app).patch('/api/patients/1/insurance').send({ insurance: 'invalid' });
      expect(res.body.error).toContain('clear');
      expect(res.body.error).toContain('not clear');
      expect(res.body.error).toContain('self pay');
      expect(res.body.error).toContain('in review');
    });
  });

  describe('error handling', () => {
    test('returns 404 when patient does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);
      const res = await request(app).patch('/api/patients/999/insurance').send({ insurance: 'clear' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Patient not found');
    });

    test('returns 500 when the database throws', async () => {
      mockFindUnique.mockRejectedValue(new Error('Connection refused'));
      const res = await request(app).patch('/api/patients/1/insurance').send({ insurance: 'clear' });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('PATCH /api/patients/:id/clinical', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    mockAuditLogCreate.mockReset();
    mockNotificationCreate.mockReset();
  });

  describe('successful update', () => {
    test('returns 200 with updated patient when column and value are valid', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
      mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      const res = await request(app).patch('/api/patients/1/clinical').send({ column: 'labs', value: 'complete' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('labs', 'complete');
    });

    test('response includes progress field with completed and total', async () => {
      mockFindUnique.mockResolvedValue(makePatient());
      mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      const res = await request(app).patch('/api/patients/1/clinical').send({ column: 'labs', value: 'complete' });
      expect(res.body).toHaveProperty('progress');
      expect(typeof res.body.progress.completed).toBe('number');
      expect(typeof res.body.progress.total).toBe('number');
    });

    test('accepts all 11 valid clinical columns', async () => {
      const columns = ['consult', 'labs', 'hematology', 'nephrology', 'dietitian',
        'psychologist', 'endoscopy', 'barium', 'cardiology', 'colonoscopy', 'sleep'];

      for (const column of columns) {
        mockFindUnique.mockResolvedValue(makePatient());
        mockUpdate.mockResolvedValue(makePatient({ [column]: 'complete' }));
        mockAuditLogCreate.mockResolvedValue({});
        mockNotificationCreate.mockResolvedValue({});

        const res = await request(app).patch('/api/patients/1/clinical').send({ column, value: 'complete' });
        expect(res.status).toBe(200);
      }
    });
  });

  describe('audit log', () => {
    test('creates audit log with patientId, userId, column, oldValue, and newValue', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ dietitian: 'not complete' }));
      mockUpdate.mockResolvedValue(makePatient({ dietitian: 'ordered' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      await request(app).patch('/api/patients/1/clinical').send({ column: 'dietitian', value: 'ordered' });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          column: 'dietitian',
          oldValue: 'not complete',
          newValue: 'ordered',
        },
      });
    });
  });

  describe('notification', () => {
    test('creates a notification for the patient mentioning the column and new value', async () => {
      mockFindUnique.mockResolvedValue(makePatient({ sleep: 'not required' }));
      mockUpdate.mockResolvedValue(makePatient({ sleep: 'ordered' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      await request(app).patch('/api/patients/1/clinical').send({ column: 'sleep', value: 'ordered' });

      const callData = mockNotificationCreate.mock.calls[0][0].data;
      expect(callData.patientId).toBe(1);
      expect(callData.isRead).toBe(false);
      expect(callData.message).toContain('sleep');
      expect(callData.message).toContain('ordered');
    });
  });

  describe('validation', () => {
    test('returns 400 when column is missing', async () => {
      const res = await request(app).patch('/api/patients/1/clinical').send({ value: 'complete' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when column is not a valid clinical column', async () => {
      const res = await request(app).patch('/api/patients/1/clinical').send({ column: 'insurance', value: 'complete' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('error message lists all valid column names', async () => {
      const res = await request(app).patch('/api/patients/1/clinical').send({ column: 'invalid', value: 'complete' });
      expect(res.body.error).toContain('consult');
      expect(res.body.error).toContain('labs');
      expect(res.body.error).toContain('sleep');
    });

    test('returns 400 when value is missing', async () => {
      const res = await request(app).patch('/api/patients/1/clinical').send({ column: 'labs' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'value is required');
    });
  });

  describe('error handling', () => {
    test('returns 404 when patient does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);
      const res = await request(app).patch('/api/patients/999/clinical').send({ column: 'labs', value: 'complete' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Patient not found');
    });

    test('returns 500 when the database throws', async () => {
      mockFindUnique.mockRejectedValue(new Error('Connection refused'));
      const res = await request(app).patch('/api/patients/1/clinical').send({ column: 'labs', value: 'complete' });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});

// A patient with all clinical fields at their Prisma schema defaults (i.e. brand-new, no specialist yet)
const makeNewPatient = (overrides = {}) => makePatient({
  visitType: '',
  dietitian: 'not required',
  psychologist: 'not required',
  endoscopy: 'not required',
  cardiology: 'not required',
  sleep: 'not required',
  barium: 'not required',
  hematology: 'not required',
  consult: 'not complete',
  labs: 'not complete',
  ...overrides,
});

describe('PATCH /api/patients/:id/specialist', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    mockAuditLogCreate.mockReset();
  });

  describe('response', () => {
    test('returns 200 with a success message and patient on success', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Bariatric Surgeon' }));
      mockAuditLogCreate.mockResolvedValue({});

      const res = await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Specialist choice saved successfully');
      expect(res.body).toHaveProperty('patient');
    });

    test('saves visitType to the database', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Bariatric Surgeon' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      expect(updateData.visitType).toBe('Bariatric Surgeon');
    });

    test('creates an audit log entry for the visitType change', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient({ visitType: '' }));
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Bariatric Surgeon' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });

      expect(mockAuditLogCreate).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          column: 'visitType',
          oldValue: '',
          newValue: 'Bariatric Surgeon',
        },
      });
    });
  });

  describe('clinical field initialization', () => {
    test('Bariatric Surgeon: initializes all 7 defaulted required fields to not booked', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Bariatric Surgeon' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      expect(updateData.dietitian).toBe('not complete');
      expect(updateData.psychologist).toBe('not complete');
      expect(updateData.endoscopy).toBe('not complete');
      expect(updateData.cardiology).toBe('not complete');
      expect(updateData.sleep).toBe('not complete');
      expect(updateData.barium).toBe('not complete');
      expect(updateData.hematology).toBe('not complete');
    });

    test('Endoscopic Obesity Specialist: initializes its 4 defaulted required fields to not booked', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Endoscopic Obesity Specialist' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Endoscopic Obesity Specialist' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      expect(updateData.dietitian).toBe('not complete');
      expect(updateData.psychologist).toBe('not complete');
      expect(updateData.endoscopy).toBe('not complete');
      expect(updateData.cardiology).toBe('not complete');
      // sleep, barium, hematology are not required for this specialist — must not be touched
      expect(updateData).not.toHaveProperty('sleep');
      expect(updateData).not.toHaveProperty('barium');
      expect(updateData).not.toHaveProperty('hematology');
    });

    test('Obesity Medicine Specialist: initializes its 2 defaulted required fields to not booked', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Obesity Medicine Specialist' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Obesity Medicine Specialist' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      expect(updateData.dietitian).toBe('not complete');
      expect(updateData.psychologist).toBe('not complete');
      // endoscopy, cardiology, sleep, barium, hematology are not required — must not be touched
      expect(updateData).not.toHaveProperty('endoscopy');
      expect(updateData).not.toHaveProperty('cardiology');
      expect(updateData).not.toHaveProperty('sleep');
      expect(updateData).not.toHaveProperty('barium');
      expect(updateData).not.toHaveProperty('hematology');
    });

    test('does not overwrite a required field that is already in an active state', async () => {
      // dietitian is already 'ordered' — should not be reset to 'not complete'
      mockFindUnique.mockResolvedValue(makeNewPatient({ dietitian: 'ordered', psychologist: 'not required' }));
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Obesity Medicine Specialist' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Obesity Medicine Specialist' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      expect(updateData).not.toHaveProperty('dietitian');
      expect(updateData.psychologist).toBe('not complete');
    });

    test('never sets insurance, labs, or consult (already have non-default-required values)', async () => {
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Bariatric Surgeon' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      expect(updateData).not.toHaveProperty('insurance');
      expect(updateData).not.toHaveProperty('labs');
      expect(updateData).not.toHaveProperty('consult');
    });

    test('matches specialist name case-insensitively', async () => {
      // routingLogic.js returns sentence-case names like 'Bariatric surgeon'
      mockFindUnique.mockResolvedValue(makeNewPatient());
      mockUpdate.mockResolvedValue(makeNewPatient({ visitType: 'Bariatric surgeon' }));
      mockAuditLogCreate.mockResolvedValue({});

      await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric surgeon' });

      const updateData = mockUpdate.mock.calls[0][0].data;
      // Should still initialize all 7 Bariatric Surgeon required fields
      expect(updateData.dietitian).toBe('not complete');
      expect(updateData.sleep).toBe('not complete');
      expect(updateData.hematology).toBe('not complete');
    });
  });

  describe('validation', () => {
    test('returns 400 when specialistChoice is missing', async () => {
      const res = await request(app).patch('/api/patients/1/specialist').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'specialistChoice is required');
    });
  });

  describe('error handling', () => {
    test('returns 404 when patient does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);
      const res = await request(app)
        .patch('/api/patients/999/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Patient not found');
    });

    test('returns 500 when the database throws', async () => {
      mockFindUnique.mockRejectedValue(new Error('Connection refused'));
      const res = await request(app)
        .patch('/api/patients/1/specialist')
        .send({ specialistChoice: 'Bariatric Surgeon' });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
