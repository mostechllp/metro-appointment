const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Setting = require('../models/Settings');

// Create new submission (public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, emirate, address, email } = req.body;

    const phoneRegex = /^\+971\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Format: +971XXXXXXXXX' });
    }

    if (!name || !emirate) {
      return res.status(400).json({ message: 'Name and Emirate are required' });
    }

    const submission = new Submission({ name, phone, emirate, address, email });
    await submission.save();

    res.status(201).json({ message: 'Submission created', submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get the current GLOBAL meeting link (public)
// ⚠️ MUST come before /:id
router.get('/meeting-link', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'global_meeting' });
    res.json(setting?.value || { platform: 'google', meetingLink: '' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single submission by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;