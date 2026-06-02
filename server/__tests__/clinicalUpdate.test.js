// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, describe/test blocks, mock setup, and assertions
// Human Contributions: Acceptance criteria and business logic provided in prompt;
//   reviewed and approved generated tests
// Notes: Focused on the PATCH /api/patients/:id/clinical route — column validation,
//   all 11 clinical columns, all checklist values, audit log creation, and notification creation.

const request = require('supertest');
const express = require('express');

const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockNotificationCreate = jest.fn();

jest.mock('../config/prisma', () => ({
  patient: { findUnique: mockFindUnique, update: mockUpdate },
  auditLog: { create: mockAuditLogCreate },
  notification: { create: mockNotificationCreate },
}));

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

const VALID_COLUMNS = [
  'consult', 'labs', 'hematology', 'nephrology', 'dietitian',
  'psychologist', 'endoscopy', 'barium', 'cardiology', 'colonoscopy', 'sleep',
];

const VALID_VALUES = ['not required', 'not complete', 'ordered', 'in progress', 'complete'];

const makePatient = (overrides = {}) => ({
  id: 1,
  mrn: 'MRN001',
  name: 'Jane Doe',
  dateOfBirth: new Date('1985-06-15'),
  bmi: 35.2,
  visitType: 'Obesity Medicine Specialist',
  insurance: 'not clear',
  consult: 'not complete',
  labs: 'not complete',
  hematology: 'not required',
  nephrology: 'not required',
  dietitian: 'not required',
  psychologist: 'not required',
  endoscopy: 'not required',
  barium: 'not required',
  cardiology: 'not required',
  colonoscopy: 'not required',
  sleep: 'not required',
  createdAt: new Date(),
  ...overrides,
});

beforeEach(() => {
  mockFindUnique.mockReset();
  mockUpdate.mockReset();
  mockAuditLogCreate.mockReset();
  mockNotificationCreate.mockReset();
});

// ─── Column validation ────────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/clinical — column validation', () => {
  test('accepts all 11 valid clinical columns', async () => {
    for (const column of VALID_COLUMNS) {
      mockFindUnique.mockResolvedValue(makePatient());
      mockUpdate.mockResolvedValue(makePatient({ [column]: 'complete' }));
      mockAuditLogCreate.mockResolvedValue({});
      mockNotificationCreate.mockResolvedValue({});

      const res = await request(app)
        .patch('/api/patients/1/clinical')
        .send({ column, value: 'complete' });

      expect(res.status).toBe(200);
    }
  });

  test('returns 400 for an invalid column name', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'insurance', value: 'complete' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 when column is missing', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ value: 'complete' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('error message lists all valid column names', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'badColumn', value: 'complete' });

    for (const col of VALID_COLUMNS) {
      expect(res.body.error).toContain(col);
    }
  });

  test('returns 400 when value is missing', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'value is required');
  });

  test('returns 404 when patient does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/patients/999/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Patient not found');
  });

  test('returns 500 when the database throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── Checklist values ─────────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/clinical — checklist values', () => {
  test.each(VALID_VALUES)('accepts value "%s"', async (value) => {
    mockFindUnique.mockResolvedValue(makePatient());
    mockUpdate.mockResolvedValue(makePatient({ labs: value }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value });

    expect(res.status).toBe(200);
    expect(res.body.labs).toBe(value);
  });

  test('response includes progress field with completed and total', async () => {
    mockFindUnique.mockResolvedValue(makePatient());
    mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(res.body).toHaveProperty('progress');
    expect(typeof res.body.progress.completed).toBe('number');
    expect(typeof res.body.progress.total).toBe('number');
  });
});

// ─── Audit log ───────────────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/clinical — audit log', () => {
  test('creates exactly one audit log entry per request', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1);
  });

  test('audit log records the correct patientId', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ id: 4, labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ id: 4, labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/4/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.patientId).toBe(4);
  });

  test('audit log records the column name that was updated', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ dietitian: 'not required' }));
    mockUpdate.mockResolvedValue(makePatient({ dietitian: 'ordered' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'dietitian', value: 'ordered' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.column).toBe('dietitian');
  });

  test('audit log records the old value before the update', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'ordered' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'in progress' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'in progress' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.oldValue).toBe('ordered');
  });

  test('audit log records the new value after the update', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.newValue).toBe('complete');
  });

  test('audit log is NOT created when column is invalid', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'badColumn', value: 'complete' });

    expect(res.status).toBe(400);
    expect(mockAuditLogCreate).not.toHaveBeenCalled();
  });

  test('audit log is NOT created when value is missing', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs' });

    expect(res.status).toBe(400);
    expect(mockAuditLogCreate).not.toHaveBeenCalled();
  });

  test('audit log is NOT created when patient is not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/patients/999/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(res.status).toBe(404);
    expect(mockAuditLogCreate).not.toHaveBeenCalled();
  });
});

// ─── Patient notification ─────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/clinical — patient notification', () => {
  test('creates exactly one notification per request', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  test('notification targets the correct patientId', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ id: 3, sleep: 'not required' }));
    mockUpdate.mockResolvedValue(makePatient({ id: 3, sleep: 'ordered' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/3/clinical')
      .send({ column: 'sleep', value: 'ordered' });

    expect(mockNotificationCreate.mock.calls[0][0].data.patientId).toBe(3);
  });

  test('notification is created with isRead false', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(mockNotificationCreate.mock.calls[0][0].data.isRead).toBe(false);
  });

  test('notification message contains the column name', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ cardiology: 'not required' }));
    mockUpdate.mockResolvedValue(makePatient({ cardiology: 'ordered' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'cardiology', value: 'ordered' });

    const { message } = mockNotificationCreate.mock.calls[0][0].data;
    expect(message).toContain('cardiology');
  });

  test('notification message contains the new value', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'in progress' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'in progress' });

    const { message } = mockNotificationCreate.mock.calls[0][0].data;
    expect(message).toContain('in progress');
  });

  test('notification message contains coordinator name', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ labs: 'not complete' }));
    mockUpdate.mockResolvedValue(makePatient({ labs: 'complete' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'labs', value: 'complete' });

    const { message } = mockNotificationCreate.mock.calls[0][0].data;
    expect(message).toContain('Test Coordinator');
  });

  test('notification is NOT created when column is invalid', async () => {
    const res = await request(app)
      .patch('/api/patients/1/clinical')
      .send({ column: 'badColumn', value: 'complete' });

    expect(res.status).toBe(400);
    expect(mockNotificationCreate).not.toHaveBeenCalled();
  });

  test('notification is NOT created when patient is not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/patients/999/clinical')
      .send({ column: 'labs', value: 'complete' });

    expect(res.status).toBe(404);
    expect(mockNotificationCreate).not.toHaveBeenCalled();
  });
});
