// AI-USAGE SUMMARY
// Tools: ChatGPT, Claude
// Overall AI Contribution: ~45%
// AI-Assisted Areas: Jest/Supertest test scaffolding, Firebase Admin mocking, Prisma mocking, protected route test structure
// Human Contributions: Selected authentication requirements, verified expected behavior, ran tests locally, fixed project-specific paths and responses
// Notes: Updated by team lead to include dateOfBirth (registration schema change) and Patient mock (User-Patient link).

const request = require('supertest');

const mockVerifyIdToken = jest.fn();

jest.mock('../../code/server/config/firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

jest.mock('../../code/server/config/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    patient: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  mockPrisma.$transaction = jest.fn(async (callback) => callback(mockPrisma));
  return mockPrisma;
});

const app = require('../../code/server/app');
const prisma = require('../../code/server/config/prisma');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // POST /api/auth/register
  // ============================================================
  describe('POST /api/auth/register', () => {
    it('registers a new patient successfully', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'newpatient@example.com',
      });

      prisma.user.findUnique.mockResolvedValue(null);

      prisma.user.create.mockResolvedValue({
        id: 1,
        firebaseUid: 'firebase-uid-123',
        name: 'New Patient',
        email: 'newpatient@example.com',
        role: 'PATIENT',
        createdAt: new Date(),
      });

      prisma.patient.create.mockResolvedValue({
        id: 10,
        userId: 1,
        mrn: 'MRN000001',
        name: 'New Patient',
        dateOfBirth: new Date('1990-01-01'),
        bmi: 0,
      });

      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New Patient', dateOfBirth: '1990-01-01', idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('newpatient@example.com');
      expect(res.body.role).toBe('PATIENT');
      expect(res.body.patientId).toBe(10);
      expect(res.body).not.toHaveProperty('passwordHash');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('rejects registration when the name is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'A', dateOfBirth: '1990-01-01', idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('rejects registration when dateOfBirth is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Valid Name', idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(400);
    });

    it('rejects registration when the idToken is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Valid Name', dateOfBirth: '1990-01-01' });

      expect(res.statusCode).toBe(400);
    });

    it('returns 409 when the user is already registered', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'existing-uid',
        email: 'existing@example.com',
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 5,
        firebaseUid: 'existing-uid',
        email: 'existing@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Existing User', dateOfBirth: '1990-01-01', idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(409);
    });

    it('returns 401 when the Firebase token is invalid', async () => {
      const tokenError = new Error('Invalid token');
      tokenError.code = 'auth/invalid-id-token';
      mockVerifyIdToken.mockRejectedValue(tokenError);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Some Name', dateOfBirth: '1990-01-01', idToken: 'bad-token' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================================
  // POST /api/auth/login
  // ============================================================
  describe('POST /api/auth/login', () => {
    it('logs in an existing user and returns their role', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'coord-uid',
        email: 'coordinator@example.com',
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 2,
        firebaseUid: 'coord-uid',
        name: 'Coord User',
        email: 'coordinator@example.com',
        role: 'COORDINATOR',
      });

      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(200);
      expect(res.body.role).toBe('COORDINATOR');
    });

    it('rejects login when the idToken is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('returns 401 when the token is expired', async () => {
      const expiredError = new Error('Token expired');
      expiredError.code = 'auth/id-token-expired';
      mockVerifyIdToken.mockRejectedValue(expiredError);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'expired-token' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================================
  // GET /api/auth/me
  // ============================================================
  describe('GET /api/auth/me', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('returns the current user when a valid token is provided', async () => {
      mockVerifyIdToken.mockResolvedValue({
        uid: 'me-uid',
        email: 'me@example.com',
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 3,
        name: 'Me User',
        email: 'me@example.com',
        role: 'PATIENT',
      });

      prisma.patient.findUnique.mockResolvedValue({ id: 10 });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer fake-valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('me@example.com');
      expect(res.body.patientId).toBe(10);
    });
  });

  // ============================================================
  // Health check
  // ============================================================
  describe('GET /api/health', () => {
    it('returns ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
