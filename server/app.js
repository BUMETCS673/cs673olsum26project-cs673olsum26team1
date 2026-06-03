// No AI Contribution

const express = require('express');
const cors = require('cors');

require('dotenv').config({ override: false });

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const notificationRoutes = require('./routes/notifications');

// AI -route
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BariatricPath API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
