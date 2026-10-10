const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const Setting = require('../models/Settings');

// ==============================
// POST /api/admin/login
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// POST /api/admin/register
// (protected — only logged-in admins can create others)
// ==============================
router.post('/register', auth, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({ email, password, name });
    res.status(201).json({
      message: 'Admin created',
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// GET /api/admin/me (verify token)
// ==============================
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// GET /api/admin/submissions (protected)
// ==============================
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// PATCH /api/admin/submissions/:id (protected)
// ==============================
router.patch('/submissions/:id', auth, async (req, res) => {
  try {
    const { platform, meetingLink } = req.body;

    if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
      return res.status(400).json({ message: 'Meeting link must start with http:// or https://' });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { platform, meetingLink },
      { new: true, runValidators: true }
    );

    if (!submission) return res.status(404).json({ message: 'Not found' });
    res.json(submission);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/meeting-link', auth, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'global_meeting' });
    res.json(
      setting?.value || { platform: 'google', meetingLink: '' }
    );
  } catch (err) {
    console.error('Get meeting link error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// PUT /api/admin/meeting-link (protected)
// Upsert the global meeting config
// ==============================
router.put('/meeting-link', auth, async (req, res) => {
  try {
    const { platform, meetingLink } = req.body;   // 👈 THE MISSING LINE

    if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
      return res
        .status(400)
        .json({ message: 'Link must start with http:// or https://' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'global_meeting' },
      {
        key: 'global_meeting',
        value: { platform, meetingLink },
        updatedAt: new Date()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(setting.value);
  } catch (err) {
    console.error('Update meeting link error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;