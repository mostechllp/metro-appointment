const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Submission = require('../models/Submission'); // 👈 Need this for cascade delete
const auth = require('../middleware/auth');

// GET all events (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }); 
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create a new event (Admin)
router.post('/', auth, async (req, res) => {
  try {
    const { title, meetingLink, date, durationMinutes } = req.body;

    if (!title || !meetingLink || !date || !durationMinutes) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^https?:\/\//.test(meetingLink)) {
      return res.status(400).json({ message: 'Meeting link must start with http:// or https://' });
    }

    const newEvent = new Event({ title, meetingLink, date: new Date(date), durationMinutes });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 👈 NEW: UPDATE an event
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, meetingLink, date, durationMinutes } = req.body;

    if (!/^https?:\/\//.test(meetingLink)) {
      return res.status(400).json({ message: 'Meeting link must start with http:// or https://' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, meetingLink, date: new Date(date), durationMinutes },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 👈 NEW: DELETE an event (and its registrations)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Cascade delete: Also remove all submissions tied to this event
    await Submission.deleteMany({ eventId: event._id });
    
    // Delete the event itself
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event and its registrations deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;