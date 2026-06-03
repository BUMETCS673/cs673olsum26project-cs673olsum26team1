// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~30%
// AI-Assisted Areas: fetch proxy pattern, error handling
// Human Contributions: integration with auth middleware, patient data fetching
// Notes: proxies AI requests to Python FastAPI service

const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/verifyAuth');
// const prisma = require('../config/prisma');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/ai/chat
router.post('/chat', verifyAuth, async (req, res) => {
  try {
    const { question, role, patient_context, patient_id } = req.body;
    // const userId = req.user?.id;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    // // Fetch patient context from DB
    // const patient = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: {
    //     id: true,
    //     name: true,
    //     insuranceStatus: true,
    //     assignedSpecialist: true,
    //   }
    // });

    // if (!patient) {
    //   return res.status(404).json({ error: 'Patient not found' });
    // }


    // Forward to Python AI service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.trim(),
        patient_id: patient_id || req.user?.id || 0,
        patient_context: patient_context || {},
        role: role || 'PATIENT'
      })
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json();
      return res.status(502).json({ error: err.detail || 'AI service error' });
    }

    const data = await aiResponse.json();
    res.json(data);

  } catch (error) {
    console.error('AI route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;