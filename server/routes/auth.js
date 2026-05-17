
const { PrismaClient } = require('@prisma/client');

// Create Prisma instance
// This connects to your database
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// POST /api/auth/register
// Register a new patient account
router.post('/register', async (req, res) => {
  try {
    res.json({ message: 'Register route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
// Login and return user role
router.post('/login', async (req, res) => {
  try {
    res.json({ message: 'Login route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
// Get current user role
router.get('/me', async (req, res) => {
  try {
    res.json(await getLoggedInUser());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const getLoggedInUser= async () => {

  // prisma.user.findUnique looks for
  // exactly one record in the User table
  // where the email matches
  // const user = await prisma.user.findUnique({
  //   where: {
  //     email: "patientr@example.com"  // match this email
  //   }
  // });

  // const user = await prisma.user.findUnique({
  //   where: {
  //     email: "coordinator@example.com"  // match this email
  //   }
  // });

const user = await prisma.user.findUnique({
    where: {
      email: "director@example.com"  // match this email
    }
  });


  
  // Returns the user object if found
  // Returns null if not found
  return user;
};

module.exports = router;