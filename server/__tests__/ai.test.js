// AI-USAGE SUMMARY
// Tools: Claude, ChatGPT
// Overall AI Contribution: ~55%
// AI-Assisted Areas: mock setup, fetch mocking, test structure
// Human Contributions: test case design, understanding of what to verify
// Notes: mocks Firebase, Prisma, and global fetch so no real connections
//        are made during tests. Follows same pattern as auth.test.js.

const request = require('supertest');

const mockVerifyIdToken = jest.fn();

jest.mock('../config/firebase-admin', () => ({
  auth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

global.fetch = jest.fn();
const app = require('../app');
const prisma = require('../config/prisma');

// Reusable test data
const VALID_TOKEN = 'fake-valid-token';

const MOCK_PATIENT = {
  id: 1,
  name: 'Jane Doe',
  insurance: 'clear',
  visitType: 'Bariatric Surgeon',
};

const MOCK_AI_RESPONSE = {
  answer: 'Your insurance is cleared. Your coordinator will contact you soon.',
  sources: ['BariatricPath Program Guide'],
};

beforeEach(() => {
  jest.clearAllMocks();

  // Default: Firebase token is valid
  mockVerifyIdToken.mockResolvedValue({
    uid: 'test-uid',
    email: 'jane@test.com',
  });

  // Default: patient exists in DB
  prisma.user.findUnique.mockResolvedValue(MOCK_PATIENT);

  
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_AI_RESPONSE,
  });
});

describe('POST /api/ai/chat', () => {

  it('returns an AI answer for a valid patient question', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What does my insurance status mean?',
        patient_id: 1,
        patient_context: { insuranceStatus: 'clear' },
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBe(MOCK_AI_RESPONSE.answer);
    expect(res.body.sources).toBeDefined();
  });

  it('calls the Python AI service with the correct data', async () => {
    await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What is my next step?',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const fetchOptions = global.fetch.mock.calls[0][1];
    const body = JSON.parse(fetchOptions.body);

    expect(body.question).toBe('What is my next step?');
    expect(body.role).toBe('PATIENT');
  });
  it('works for COORDINATOR role', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'How do I update insurance status?',
        patient_id: 1,
        patient_context: { role: 'coordinator' },
        role: 'COORDINATOR',
      });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.role).toBe('COORDINATOR');
  });

  it('works for PROGRAM_DIRECTOR role', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What metrics should I track?',
        patient_id: 1,
        patient_context: { role: 'program_director' },
        role: 'PROGRAM_DIRECTOR',
      });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.role).toBe('PROGRAM_DIRECTOR');
  });

  it('merges DB patient data with frontend context', async () => {

    await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What is my status?',
        patient_id: 1,
        patient_context: { someExtraField: 'value' },
        role: 'PATIENT',
      });

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);

    // DB values should be present in what was sent to AI service
    expect(body.patient_context.insuranceStatus).toBe('clear');
    expect(body.patient_context.assignedSpecialist).toBe('Bariatric Surgeon');
  });


  it('returns 400 when question is missing', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
        // no question field
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/question/);
  });

  it('returns 400 when question is empty string', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: '',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when question is only whitespace', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: '    ',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(400);
  });

  it('returns 401 when no auth token is provided', async () => {

    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        question: 'What is my status?',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(401);
  });

  it.skip('returns 401 when Firebase token is invalid', async () => {
    const tokenError = new Error('Invalid token');
    tokenError.code = 'auth/invalid-id-token';
    mockVerifyIdToken.mockRejectedValue(tokenError);

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', 'Bearer bad-token')
      .send({
        question: 'What is my status?',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(401);
  });

// ============================================================
// ERROR HANDLING TESTS
// These test what happens when downstream services fail
// ============================================================

  it('returns 502 when the Python AI service returns an error', async () => {

    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'AI service overloaded' }),
    });

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What is my status?',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBeDefined();
  });

  it('returns 500 when fetch throws a network error', async () => {
    
    global.fetch.mockRejectedValue(new Error('Connection refused'));

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What is my status?',
        patient_id: 1,
        patient_context: {},
        role: 'PATIENT',
      });

    expect(res.statusCode).toBe(500);
  });

  it('still works if DB fetch fails — falls back to frontend context', async () => {
    
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, email: 'jane@test.com', role: 'PATIENT' }) 
      .mockRejectedValueOnce(new Error('DB connection lost')); // route DB call fails

    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({
        question: 'What is my status?',
        patient_id: 1,
        patient_context: { insuranceStatus: 'clear' },
        role: 'PATIENT',
      });

    // Should still succeed using frontend context as fallback
    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBeDefined();
  });

});
