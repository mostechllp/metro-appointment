require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const submissionRoutes = require('./routes/submission');
const adminRoutes = require('./routes/admin');

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
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Silently reject browser-extension requests
    if (origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://') ||
        origin.startsWith('safari-extension://')) {
      return callback(null, false); // no log, no header, just reject
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    console.warn('🚫 CORS blocked origin:', origin);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express 5–safe preflight
app.options(/.*/, cors());
app.use(express.json());

// Routes
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Metro StarCare API running'));

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