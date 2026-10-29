const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Breast Cancer Awareness"
  meetingLink: { type: String, required: true },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, default: 60 },
  // Status will be automatically calculated, but can be overridden by admin
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed'], 
    default: 'upcoming' 
  },
  certificatesSent: { type: Boolean, default: false }, // To ensure we only send once
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);