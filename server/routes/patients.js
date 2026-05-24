// AI-USAGE SUMMARY
// Tools: Vs Code Copilot and Claud Code (I was experimenting with different AI tools)
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation, error handling, and route structure
// Human Contributions: Modularizing the search logic. Originally, the AI put it all in the route handler, 
// but I moved it to a separate function in the searchDB module for better organization and reusability. 
// Notes: see below for detailed breakdown of contributions and modifications.

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { searchPatients } = require('../searchDB/searchDB');
const { computeProgress } = require('../searchDB/calculateProgress');
const {verifyAuth} = require('../middleware/verifyAuth');

// GET /api/patients
// Returns all patients with MRN, name, BMI, specialist type, insurance status, and progress.
// Supports: ?search=  ?specialistType=  ?insuranceStatus=
router.get('/', verifyAuth, async (req, res) => {
  // AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: My prompt included the user story and acceptance tests for the coordinator dashboard, 
// which included the requirement for a patient search endpoint that supports filtering by specialist type and insurance status.
// I prompted a refactoring to bring it into its own component.
// AI Contribution: Initial draft (~90%) 
// Modifications: 
//  - Refactored from inline code in the coordinator dashboard to the searchDB module for better modularity and reusability. 
// Verification: 
// - Manually tested the route in the coordinator dashboard to ensure data is fetched and displayed correctly, and that the search and filter functionalities work as expected.
// Confidence: High
  try {
    const { search, specialistType, insuranceStatus } = req.query;
    const patients = await searchPatients(prisma, search, { specialistType, insuranceStatus });
    const result = patients.map((p) => ({ ...p, progress: computeProgress(p) }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patients/:id
// Get one patient by ID
router.get('/:id', verifyAuth, async (req, res) => {
  //initial route to get patient by ID, not currently used in frontend but may be useful for future features like a patient detail view
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