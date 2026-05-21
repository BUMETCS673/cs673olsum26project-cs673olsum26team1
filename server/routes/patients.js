const express = require('express');
const router = express.Router();

// GET /api/patients
// Get all patients (coordinator and director)
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Get all patients route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patients/:id
// Get one patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: `Get patient ${id} route working` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/patients
// Create new patient record
router.post('/', async (req, res) => {
  try {
    res.json({ message: 'Create patient route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/insurance
// Coordinator updates insurance status
router.patch('/:id/insurance', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: `Update insurance for patient ${id} route working` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/clinical
// Coordinator updates clinical order columns
router.patch('/:id/clinical', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: `Update clinical column for patient ${id} route working` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;