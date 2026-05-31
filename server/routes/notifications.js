const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAuth } = require('../middleware/verifyAuth');

// GET /api/notifications/:patientId
// Get all notifications for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    res.json({ message: `Get notifications for patient ${patientId} route working` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/:id/read
// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: `Mark notification ${id} as read route working` });
  } catch (error) {
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