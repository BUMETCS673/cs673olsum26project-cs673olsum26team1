// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Test structure, describe/test blocks, setup, and assertions
// Human Contributions: Design requirements, test scope decision, reviewed all generated tests

const request = require('supertest');
const express = require('express');

const mockNotificationCreate = jest.fn();
const mockNotificationFindMany = jest.fn();

const mockNotificationUpdate = jest.fn();

jest.mock('../config/prisma', () => ({
  notification: {
    create: mockNotificationCreate,
    findMany: mockNotificationFindMany,
    update: mockNotificationUpdate,
  },
}));

jest.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (req, res, next) => {
    req.user = { id: 10, name: 'Test Coordinator', email: 'coord@test.com', role: 'COORDINATOR' };
    next();
  },
  requireRole: () => (req, res, next) => next(),
}));

const notificationRouter = require('../routes/notifications');

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

describe('GET /api/notifications/:patientId', () => {
  beforeEach(() => {
    mockNotificationFindMany.mockReset();
  });

  describe('response format', () => {
    test('returns 200 with an array of notifications', async () => {
      mockNotificationFindMany.mockResolvedValue([
        makeNotification({ id: 2, createdAt: new Date('2026-05-30T10:00:00Z').toISOString() }),
        makeNotification({ id: 1, createdAt: new Date('2026-05-29T10:00:00Z').toISOString() }),
      ]);

      const res = await request(app).get('/api/notifications/5');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    test('returns 200 with an empty array when patient has no notifications', async () => {
      mockNotificationFindMany.mockResolvedValue([]);

      const res = await request(app).get('/api/notifications/5');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('each notification includes id, patientId, message, isRead, and createdAt', async () => {
      mockNotificationFindMany.mockResolvedValue([makeNotification()]);

      const res = await request(app).get('/api/notifications/5');
      const notification = res.body[0];
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('patientId');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('isRead');
      expect(notification).toHaveProperty('createdAt');
    });

    test('queries prisma with correct patientId and descending order', async () => {
      mockNotificationFindMany.mockResolvedValue([]);

      await request(app).get('/api/notifications/5');

      expect(mockNotificationFindMany).toHaveBeenCalledWith({
        where: { patientId: 5 },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          patientId: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      });
    });

    test('notifications are returned most recent first', async () => {
      mockNotificationFindMany.mockResolvedValue([
        makeNotification({ id: 3, createdAt: '2026-05-30T12:00:00Z' }),
        makeNotification({ id: 2, createdAt: '2026-05-30T10:00:00Z' }),
        makeNotification({ id: 1, createdAt: '2026-05-29T08:00:00Z' }),
      ]);

      const res = await request(app).get('/api/notifications/5');
      expect(res.body[0].id).toBe(3);
      expect(res.body[1].id).toBe(2);
      expect(res.body[2].id).toBe(1);
    });
  });

  describe('validation', () => {
    test('returns 400 when patientId is not a number', async () => {
      const res = await request(app).get('/api/notifications/abc');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('error handling', () => {
    test('returns 500 when the database throws', async () => {
      mockNotificationFindMany.mockRejectedValue(new Error('Connection refused'));

      const res = await request(app).get('/api/notifications/5');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
  describe('PATCH /api/notifications/:id/read', () => {
    const mockNotificationUpdate = jest.fn();
  
    beforeAll(() => {
      require('../config/prisma').notification.update = mockNotificationUpdate;
    });
  
    beforeEach(() => {
      mockNotificationUpdate.mockReset();
    });
  
    test('marks notification as read and returns updated record', async () => {
      mockNotificationUpdate.mockResolvedValue({ id: 1, isRead: true });
  
      const res = await request(app)
        .patch('/api/notifications/1/read')
        .set('Authorization', 'Bearer fake-token');
  
      expect(res.status).toBe(200);
      expect(res.body.isRead).toBe(true);
    });
  
    test('returns 400 when id is not a number', async () => {
      const res = await request(app)
        .patch('/api/notifications/abc/read');
  
      expect(res.status).toBe(400);
    });
  
    test('returns 404 when notification does not exist', async () => {
      const err = new Error('Not found');
      err.code = 'P2025';
      mockNotificationUpdate.mockRejectedValue(err);
  
      const res = await request(app)
        .patch('/api/notifications/999/read');
  
      expect(res.status).toBe(404);
    });
  });
});
