const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
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

// POST /api/patients/recommendation
// Calculate specialist recommendation
router.post('/recommendation', async (req, res) => {
  try {
    const { bmi, previousSurgery } = req.body;
    const { getSpecialistRecommendation } = require('../utils/routingLogic');
    
    if (bmi === undefined) {
      return res.status(400).json({ error: 'BMI is required' });
    }

    const recommendation = getSpecialistRecommendation(bmi, previousSurgery);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/specialist
// Save patient specialist choice
router.patch('/:id/specialist', async (req, res) => {
  try {
    const { id } = req.params;
    const { specialistChoice } = req.body;
    
    if (!specialistChoice) {
      return res.status(400).json({ error: 'specialistChoice is required' });
    }
    
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: { visitType: specialistChoice }
    });
    
    res.json({ message: 'Specialist choice saved successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;