const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  emirate: { type: String, required: true },
  address: { type: String },
  email: { type: String },
  platform: {
    type: String,
    enum: ['google', 'teams', 'zoom', 'other'],
    default: 'google'
  },
  meetingLink: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);