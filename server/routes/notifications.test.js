// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, describe/test blocks, setup, and assertions
// Human Contributions: Design requirements, test scope decision, reviewed all generated tests

const request = require('supertest');
const express = require('express');

const mockNotificationCreate = jest.fn();

jest.mock('../config/prisma', () => ({
  notification: { create: mockNotificationCreate },
}));

jest.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (req, res, next) => {
    req.user = { id: 10, name: 'Test Coordinator', email: 'coord@test.com', role: 'COORDINATOR' };
    next();
  },
  requireRole: () => (req, res, next) => next(),
}));

const notificationRouter = require('./notifications');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRouter);

const makeNotification = (overrides = {}) => ({
  id: 1,
  patientId: 5,
  message: 'Your insurance status has been updated.',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('POST /api/notifications', () => {
  beforeEach(() => {
    mockNotificationCreate.mockReset();
  });

  describe('successful creation', () => {
    test('returns 201 with the created notification', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotification());

      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: 'Your insurance status has been updated.' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('patientId', 5);
      expect(res.body).toHaveProperty('message', 'Your insurance status has been updated.');
    });

    test('isRead is false on the created notification', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotification());

      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: 'Your labs have been ordered.' });

      expect(res.body).toHaveProperty('isRead', false);
    });

    test('creates notification in database with correct data', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotification());

      await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: 'Your labs have been ordered.' });

      expect(mockNotificationCreate).toHaveBeenCalledWith({
        data: {
          patientId: 5,
          message: 'Your labs have been ordered.',
          isRead: false,
        },
      });
    });

    test('trims whitespace from message before saving', async () => {
      mockNotificationCreate.mockResolvedValue(makeNotification({ message: 'Trimmed message' }));

      await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: '  Trimmed message  ' });

      const savedMessage = mockNotificationCreate.mock.calls[0][0].data.message;
      expect(savedMessage).toBe('Trimmed message');
    });
  });

  describe('validation', () => {
    test('returns 400 when patientId is missing', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ message: 'Some message' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when patientId is a string instead of a number', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: '5', message: 'Some message' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: 5 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when message is an empty string', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when message is only whitespace', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: '   ' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('error handling', () => {
    test('returns 500 when the database throws', async () => {
      mockNotificationCreate.mockRejectedValue(new Error('Connection refused'));

      const res = await request(app)
        .post('/api/notifications')
        .send({ patientId: 5, message: 'Some message' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
