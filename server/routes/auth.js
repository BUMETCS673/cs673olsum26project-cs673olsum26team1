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
    body('idToken')
      .notEmpty()
      .withMessage('Firebase ID token is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, idToken } = req.body;

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid: firebaseUid, email } = decodedToken;

      const existingUser = await prisma.user.findUnique({
        where: { firebaseUid },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already registered',
        });
      }
      const newUser = await prisma.user.create({
        data: {
          firebaseUid,
          name,
          email,
          role: 'PATIENT',
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          column: 'user.created',
          oldValue: '',
          newValue: `User ${email} registered as PATIENT`,
        },
      });
       return res.status(201).json({
        id: newUser.id,
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

      // EDGE CASE: user authenticated with Firebase (e.g. Google) but has no
      // DB record yet — this happens if they "log in" with Google before ever
      // "registering". We auto-create them as PATIENT so the flow doesn't break.
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
    // verifyAuth middleware already loaded the user into req.user
    return res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.error('Me route error:', error);
    return res.status(500).json({ error: 'Failed to load user' });
  }
});

module.exports = router;