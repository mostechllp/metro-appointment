const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Event = require('../models/Event');

// Create new submission (public)
router.post('/', async (req, res) => {
  try {
    const { eventId, name, phone, emirate, address, email } = req.body;

    const phoneRegex = /^\+971\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Format: +971XXXXXXXXX' });
    }

    if (!name || !emirate || !eventId || !email) {
      return res.status(400).json({ message: 'Name, Email, Emirate, and Event are required' });
    }

    const submission = new Submission({ eventId, name, phone, emirate, address, email });
    await submission.save();

    // Populate Event so the frontend Modal gets the meeting link and title immediately
    const populatedSubmission = await Submission.findById(submission._id).populate('eventId');

    res.status(201).json({ message: 'Submission created', submission: populatedSubmission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active events for the public registration form dropdown
router.get('/active-events', async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;