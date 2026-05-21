const express = require('express');
const router = express.Router();

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
router.post('/', async (req, res) => {
  try {
    res.json({ message: 'Create notification route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;