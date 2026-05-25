// AI-USAGE SUMMARY
// Tools: ChatGPT | Claude
// Overall AI Contribution: ~45%
// AI-Assisted Areas: Jest/Supertest test scaffolding, Firebase Admin mocking, Prisma mocking, protected route test structure
// Human Contributions: Selected authentication requirements, verified expected behavior, ran tests locally, fixed project-specific paths and responses
// Notes: AI-assisted code was reviewed, corrected, and validated locally. All authentication tests passed before integration.

const request = require('supertest');

const mockVerifyIdToken = jest.fn();

jest.mock('../config/firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const app = require('../app');
const prisma = require('../config/prisma');

describe('Auth Routes', () => {
  // Reset all mocks before each test so they don't leak state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // POST /api/auth/register
  // ============================================================
  describe('POST /api/auth/register', () => {
    it('registers a new patient successfully', async () => {
      // Arrange: tell the mocks what to return
      mockVerifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'newpatient@example.com',
      });

      prisma.user.findUnique.mockResolvedValue(null); // user doesn't exist yet

      prisma.user.create.mockResolvedValue({
        id: 1,
        firebaseUid: 'firebase-uid-123',
        name: 'New Patient',
        email: 'newpatient@example.com',
        role: 'PATIENT',
        createdAt: new Date(),
      });

      prisma.auditLog.create.mockResolvedValue({});

      // Act
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New Patient', idToken: 'fake-valid-token' });

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('newpatient@example.com');
      expect(res.body.role).toBe('PATIENT');
      expect(res.body).not.toHaveProperty('passwordHash'); // never leak secrets
      expect(prisma.auditLog.create).toHaveBeenCalled(); // accountability
    });

    it('rejects registration when the name is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'A', idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('rejects registration when the idToken is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Valid Name' });

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
        .send({ name: 'Existing User', idToken: 'fake-valid-token' });

      expect(res.statusCode).toBe(409);
    });

    it('returns 401 when the Firebase token is invalid', async () => {
      const tokenError = new Error('Invalid token');
      tokenError.code = 'auth/invalid-id-token';

      // Correct: Firebase token errors should reject, not resolve
      mockVerifyIdToken.mockRejectedValue(tokenError);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Some Name', idToken: 'bad-token' });

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

      // Correct: Firebase token errors should reject, not resolve
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

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer fake-valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('me@example.com');
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
