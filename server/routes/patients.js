const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { searchPatients } = require('../searchDB/searchDB');

// GET /api/patients
// Get all patients (coordinator and director)
// Supports search query parameter to filter by name, MRN, or date of birth
router.get('/', async (req, res) => {
  
  try {
    const { search } = req.query;
    const patients = await searchPatients(prisma, search);
    res.json(patients);
    //console.log(`Search query: "${search}" - Found ${patients.length} patients`);
    //console.log(patients.map(p => `  - ${p.name} (MRN: ${p.mrn}, DOB: ${p.dateOfBirth.toISOString().split('T')[0]})`).join('\n'));
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

module.exports = router;