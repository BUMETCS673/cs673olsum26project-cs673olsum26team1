// AI-USAGE SUMMARY
// Tools: ChatGPT
// Overall AI Contribution: ~25%
// AI-Assisted Areas: Debugging Google signup flow, patient record creation, Prisma schema mismatch, and auth route review
// Human Contributions: Business rules, Firebase setup, implementation testing, manual verification, and final integration
// Notes: AI suggestions were reviewed and adapted to match BariatricPath registration and patient onboarding requirements.

const express = require('express');
const { body, validationResult } = require('express-validator');
const admin = require('../config/firebase-admin');
const prisma = require('../config/prisma');
const { verifyAuth } = require('../middleware/verifyAuth');


const router = express.Router();

// POST /api/auth/register
// Register a new patient account
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('dateOfBirth')
      .notEmpty()
      .withMessage('Date of birth is required')
      .isISO8601()
      .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
    body('idToken')
      .notEmpty()
      .withMessage('Firebase ID token is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dateOfBirth, idToken } = req.body;

    const patientDateOfBirth = dateOfBirth || '2000-01-01';


    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid: firebaseUid, email } = decodedToken;

      const existingUser = await prisma.user.findUnique({
        where: { firebaseUid },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already registered',
          hint: 'Please log in instead'
        });
      }

      const { newUser, newPatient } = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firebaseUid,
            name,
            email,
            role: 'PATIENT',
          },
        });

        const mrn = `MRN${String(createdUser.id).padStart(6, '0')}`;

        const createdPatient = await tx.patient.create({
          data: {
            userId: createdUser.id,
            mrn,
            name,
            dateOfBirth: new Date(patientDateOfBirth),
            bmi: 0,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: createdUser.id,
            patientId: createdPatient.id,
            column: 'user.created',
            oldValue: '',
            newValue: `User ${email} registered as PATIENT`,
          },
        });

        return {
          newUser: createdUser,
          newPatient: createdPatient,
        };
      });


      return res.status(201).json({
        id: newUser.id,
        patientId: newPatient.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      });

    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Token expired, please try again' });
      }
      if (error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// POST /api/auth/login
// Login and return user role
router.post(
  '/login',
  [body('idToken').notEmpty().withMessage('Firebase ID token is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idToken } = req.body;

    try {
      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid: firebaseUid, email, name: googleName } = decodedToken;

      // Look up the user in our database
      let user = await prisma.user.findUnique({
        where: { firebaseUid },
      });


      if (!user) {
        user = await prisma.user.create({
          data: {
            firebaseUid,
            name: googleName || 'New Patient',
            email,
            role: 'PATIENT',
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            column: 'user.created',
            oldValue: '',
            newValue: `User ${email} auto-created as PATIENT via login`,
          },
        });
      }

      // Audit the login event
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          column: 'user.login',
          oldValue: '',
          newValue: `User ${email} logged in`,
        },
      });

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Session expired, please log in again' });
      }
      return res.status(401).json({ error: 'Login failed' });
    }
  }
);
// GET /api/auth/me
// Get current user role
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const responseData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (patient) responseData.patientId = patient.id;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Me route error:', error);
    return res.status(500).json({ error: 'Failed to load user' });
  }
});

module.exports = router;