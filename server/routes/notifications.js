const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAuth } = require('../middleware/verifyAuth');

// GET /api/notifications/:patientId
// Get all notifications for a patient ordered by most recent first
router.get('/:patientId', verifyAuth, async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);

    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'patientId must be a number' });
    }

    const notifications = await prisma.notification.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        patientId: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/:id/read
// Mark notification as read
router.patch('/:id/read', verifyAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });
    res.json(notification);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications
// Create new notification
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { patientId, message } = req.body;

    if (!patientId || typeof patientId !== 'number') {
      return res.status(400).json({ error: 'patientId is required and must be a number' });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'message is required' });
    }

    const notification = await prisma.notification.create({
      data: {
        patientId,
        message: message.trim(),
        isRead: false,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;