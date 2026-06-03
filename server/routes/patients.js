const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAuth } = require('../middleware/verifyAuth');
const { getSpecialistRecommendation } = require('../utils/routingLogic');
const { searchPatients, computeProgress } = require('../searchDB/searchDB');
const { createAuditEntry } = require('../utils/auditUtils');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// GET /api/patients
// Returns all patients with progress. Supports ?search= ?specialistType= ?insuranceStatus=
router.get('/', verifyAuth, async (req, res) => {
  try {
    const { search, specialistType, insuranceStatus } = req.query;
    const patients = await searchPatients(prisma, search, { specialistType, insuranceStatus });
    const result = patients.map((p) => ({ ...p, progress: computeProgress(p) }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/patients/recommendation
// Calculate specialist recommendation based on BMI and surgery history
router.post('/recommendation', verifyAuth, async (req, res) => {
  try {
    const { bmi, previousSurgery } = req.body;

    if (bmi === undefined) {
      return res.status(400).json({ error: 'BMI is required' });
    }

    const recommendation = getSpecialistRecommendation(bmi, previousSurgery);
    res.json(recommendation);
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

// GET /api/patients/:id
// Get one patient by ID
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { REQUIRED_ITEMS } = require('../searchDB/calculateProgress');
    const progress = computeProgress(patient);

    const matchedKey = Object.keys(REQUIRED_ITEMS).find(
      (key) => key.toLowerCase() === patient.visitType?.toLowerCase()
    );
    const requiredFields = REQUIRED_ITEMS[matchedKey] || [];

    const checklist = requiredFields.map((field) => {
      let status = patient[field];
      if (field === 'insurance') {
        if (patient.insurance === 'clear' || patient.insurance === 'self pay') {
          status = 'complete';
        } else {
          status = 'not complete';
        }
      } else {
        if (status === 'not booked') {
          status = 'not complete';
        }
      }
      return {
        field,
        status: status || 'not complete',
      };
    });

    // Find the last coordinator who made an audit log entry for this patient
    const lastAuditLog = await prisma.auditLog.findFirst({
      where: {
        patientId: patient.id,
        user: { role: 'COORDINATOR' },
      },
      orderBy: { timestamp: 'desc' },
      include: { user: true },
    });
    const assignedCoordinator = lastAuditLog?.user?.name || null;

    res.json({
      ...patient,
      insuranceStatus: patient.insurance,
      assignedSpecialist: patient.visitType,
      progress,
      checklist,
      assignedCoordinator,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/insurance
// Coordinator updates insurance status
router.patch('/:id/insurance', verifyAuth, async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { insurance } = req.body;

    const VALID_VALUES = ['clear', 'not clear', 'self pay', 'in review'];
    if (!insurance || !VALID_VALUES.includes(insurance)) {
      return res.status(400).json({ error: `insurance must be one of: ${VALID_VALUES.join(', ')}` });
    }

    const existing = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!existing) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: { insurance },
    });

    await createAuditEntry(prisma, patientId, 'insurance', existing.insurance, insurance);

    await prisma.notification.create({
      data: {
        patientId,
        message: `Your insurance status has been updated to "${insurance}" by ${req.user.name}.`,
        isRead: false,
      },
    });

    res.json({ ...updated, progress: computeProgress(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/clinical
// Coordinator updates a clinical order column
router.patch('/:id/clinical', verifyAuth, async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { column, value } = req.body;

    const VALID_COLUMNS = [
      'consult', 'labs', 'hematology', 'nephrology', 'dietitian',
      'psychologist', 'endoscopy', 'barium', 'cardiology', 'colonoscopy', 'sleep',
    ];

    if (!column || !VALID_COLUMNS.includes(column)) {
      return res.status(400).json({ error: `column must be one of: ${VALID_COLUMNS.join(', ')}` });
    }

    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ error: 'value is required' });
    }

    const existing = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!existing) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: { [column]: value },
    });

    await createAuditEntry(prisma, patientId, column, existing[column], value);

    await prisma.notification.create({
      data: {
        patientId,
        message: `Your ${column} status has been updated to "${value}" by ${req.user.name}.`,
        isRead: false,
      },
    });

    res.json({ ...updated, progress: computeProgress(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/bmi
// Patient saves their calculated BMI after the BMI calculation page
router.patch('/:id/bmi', verifyAuth, async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    const bmi = Number(req.body.bmi);

    if (!bmi || isNaN(bmi) || bmi <= 0) {
      return res.status(400).json({ error: 'Valid BMI value is required' });
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: { bmi },
    });

    return res.status(200).json({ id: patient.id, bmi: patient.bmi });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/patients/:id/specialist
// Save patient specialist choice
router.patch('/:id/specialist', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { specialistChoice } = req.body;

    if (!specialistChoice) {
      return res.status(400).json({ error: 'specialistChoice is required' });
    }

    const existingPatient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: { visitType: specialistChoice },
    });

    await prisma.auditLog.create({
      data: {
        patientId: parseInt(id),
        column: 'visitType',
        oldValue: existingPatient.visitType || '',
        newValue: specialistChoice,
      },
    });

    res.json({ message: 'Specialist choice saved successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/patients/:id/submit
// Creates coordinator notification and sends confirmation email to patient
router.post('/:id/submit', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (!patient.visitType) {
      return res.status(400).json({ error: 'Patient must choose a specialist before submitting' });
    }

    const notification = await prisma.notification.create({
      data: {
        patientId: patient.id,
        message: `New patient registration: ${patient.name} requires scheduling for a ${patient.visitType}.`,
        isRead: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        patientId: patient.id,
        column: 'status',
        oldValue: 'pending',
        newValue: 'submitted',
      },
    });

    // Look up User email since Patient model does not have an email field
    if (patient.userId) {
      const user = await prisma.user.findUnique({
        where: { id: patient.userId },
        select: { email: true },
      });

      if (user?.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'BariatricPath - Registration Confirmation',
            text: `Hello ${patient.name},\n\nThank you for completing your BariatricPath registration. You are recommended to see a ${patient.visitType}. A program coordinator will call you within 1 to 2 business days to schedule your initial appointment.\n\nThank you!`,
          });
        } catch (emailErr) {
          console.error('Email failed, continuing:', emailErr.message);
        }
      }
    }

    res.json({ message: 'Profile submitted successfully', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
