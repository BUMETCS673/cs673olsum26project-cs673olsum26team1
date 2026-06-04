// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, describe/test blocks, mock setup, and assertions
// Human Contributions: Acceptance criteria and business logic provided in prompt;
//   reviewed and approved generated tests
// Notes: Focused on the PATCH /api/patients/:id/insurance route — insurance update,
//   audit log creation, and patient notification creation.

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

const makePatient = (overrides = {}) => ({
  id: 1,
  mrn: 'MRN001',
  name: 'Jane Doe',
  dateOfBirth: new Date('1985-06-15'),
  bmi: 35.2,
  visitType: 'Obesity Medicine Specialist',
  insurance: 'not clear',
  labs: 'not complete',
  consult: 'not complete',
  dietitian: 'not required',
  psychologist: 'not required',
  endoscopy: 'not required',
  cardiology: 'not required',
  sleep: 'not required',
  barium: 'not required',
  hematology: 'not required',
  nephrology: 'not required',
  colonoscopy: 'not required',
  createdAt: new Date(),
  ...overrides,
});

beforeEach(() => {
  mockFindUnique.mockReset();
  mockUpdate.mockReset();
  mockAuditLogCreate.mockReset();
  mockNotificationCreate.mockReset();
});

// ─── Insurance update ────────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/insurance — update', () => {
  test('returns 200 and updated insurance value on success', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(res.status).toBe(200);
    expect(res.body.insurance).toBe('clear');
  });

  test('accepts "clear"', async () => {
    mockFindUnique.mockResolvedValue(makePatient());
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(res.status).toBe(200);
    expect(res.body.insurance).toBe('clear');
  });

  test('accepts "not clear"', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'not clear' });

    expect(res.status).toBe(200);
    expect(res.body.insurance).toBe('not clear');
  });

  test('accepts "self pay"', async () => {
    mockFindUnique.mockResolvedValue(makePatient());
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'self pay' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'self pay' });

    expect(res.status).toBe(200);
    expect(res.body.insurance).toBe('self pay');
  });

  test('accepts "in review"', async () => {
    mockFindUnique.mockResolvedValue(makePatient());
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'in review' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'in review' });

    expect(res.status).toBe(200);
    expect(res.body.insurance).toBe('in review');
  });

  test('response includes a progress field with completed and total', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(res.body).toHaveProperty('progress');
    expect(typeof res.body.progress.completed).toBe('number');
    expect(typeof res.body.progress.total).toBe('number');
  });

  test('returns 400 when insurance field is missing', async () => {
    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for an invalid insurance value', async () => {
    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'approved' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('clear');
    expect(res.body.error).toContain('not clear');
    expect(res.body.error).toContain('self pay');
    expect(res.body.error).toContain('in review');
  });

  test('returns 404 when the patient does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/patients/999/insurance')
      .send({ insurance: 'clear' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Patient not found');
  });

  test('returns 500 when the database throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── Audit log ───────────────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/insurance — audit log', () => {
  test('creates exactly one audit log entry per request', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1);
  });

  test('audit log records the correct patientId', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ id: 7, insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ id: 7, insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/7/insurance')
      .send({ insurance: 'clear' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.patientId).toBe(7);
  });

  test('audit log records column as "insurance"', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.column).toBe('insurance');
  });

  test('audit log records the old value before the update', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.oldValue).toBe('not clear');
  });

  test('audit log records the new value after the update', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(mockAuditLogCreate.mock.calls[0][0].data.newValue).toBe('clear');
  });

  test('audit log is NOT created when the request is invalid', async () => {
    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'invalid' });

    expect(res.status).toBe(400);
    expect(mockAuditLogCreate).not.toHaveBeenCalled();
  });

  test('audit log is NOT created when the patient is not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/patients/999/insurance')
      .send({ insurance: 'clear' });

    expect(res.status).toBe(404);
    expect(mockAuditLogCreate).not.toHaveBeenCalled();
  });
});

// ─── Patient notification ─────────────────────────────────────────────────────

describe('PATCH /api/patients/:id/insurance — patient notification', () => {
  test('creates exactly one notification per request', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  test('notification targets the correct patientId', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ id: 5, insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ id: 5, insurance: 'self pay' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/5/insurance')
      .send({ insurance: 'self pay' });

    expect(mockNotificationCreate.mock.calls[0][0].data.patientId).toBe(5);
  });

  test('notification is created with isRead false', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    expect(mockNotificationCreate.mock.calls[0][0].data.isRead).toBe(false);
  });

  test('notification message contains the new insurance value', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    const { message } = mockNotificationCreate.mock.calls[0][0].data;
    expect(message).toContain('clear');
  });

  test('notification message contains coordinator name', async () => {
    mockFindUnique.mockResolvedValue(makePatient({ insurance: 'not clear' }));
    mockUpdate.mockResolvedValue(makePatient({ insurance: 'clear' }));
    mockAuditLogCreate.mockResolvedValue({});
    mockNotificationCreate.mockResolvedValue({});

    await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'clear' });

    const { message } = mockNotificationCreate.mock.calls[0][0].data;
    expect(message).toContain('Test Coordinator');
  });

  test('notification is NOT created when the request is invalid', async () => {
    const res = await request(app)
      .patch('/api/patients/1/insurance')
      .send({ insurance: 'bad value' });

    expect(res.status).toBe(400);
    expect(mockNotificationCreate).not.toHaveBeenCalled();
  });

  test('notification is NOT created when the patient is not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/patients/999/insurance')
      .send({ insurance: 'clear' });

    expect(res.status).toBe(404);
    expect(mockNotificationCreate).not.toHaveBeenCalled();
  });
});
