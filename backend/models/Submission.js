const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // 👈 Link to Event
  name: { type: String, required: true },
  phone: { type: String, required: true },
  emirate: { type: String, required: true },
  email: { type: String, required: true }, // 👈 Make email required for certificates!
  attendance: {
    type: String,
    enum: ['attended', 'not-attended'],
    default: 'attended'
  },
  certificateSent: { type: Boolean, default: false }, // 👈 Track if this specific person got their cert
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);