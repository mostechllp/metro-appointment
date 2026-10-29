require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const submissionRoutes = require('./routes/submission');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/event');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://metrostarcare.ae'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://') ||
        origin.startsWith('safari-extension://')) {
      return callback(null, false);
    }
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.warn('🚫 CORS blocked origin:', origin);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options(/.*/, cors());
app.use(express.json());

// Routes
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/events', eventRoutes); 

app.get('/', (req, res) => res.send('Metro StarCare API running'));

// 👈 START CRON JOB BEFORE SERVER LISTENS
require('./utils/cronJob'); 

// Connect MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('❌ Mongo error:', err));