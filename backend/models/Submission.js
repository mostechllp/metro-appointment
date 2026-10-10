const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  emirate: { type: String, required: true },
  address: { type: String },
  email: { type: String },
  attendance: {
    type: String,
    enum: ['attended', 'not-attended'],
    default: 'attended'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);