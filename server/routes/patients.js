const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

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


// POST /api/patients/:id/submit
// Submits the patient profile, creates a coordinator notification, and sends an email
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the patient's data from the database
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    //Create the notification record for the coordinator
    const notification = await prisma.notification.create({
      data: {
        patientId: patient.id,
        message: `New patient registration: ${patient.name} requires scheduling for a ${patient.visitType}.`,
        isRead: false
      }
    });

    // Nodemailer Configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Draft and Send the Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      //to: "lijnkyle@gmail.com",
      subject: 'BariatricPath - Registration Confirmation',
      text: `Hello ${patient.name},\n\nThank you for completing your BariatricPath registration. You are recommended to see a ${patient.visitType}. A program coordinator will call you within 1 to 2 business days to schedule your initial appointment.\n\nThank you!`
    };

    await transporter.sendMail(mailOptions);

    // Send success response back to the React frontend
    res.json({
      message: 'Profile submitted and email sent successfully',
      notification: notification
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;