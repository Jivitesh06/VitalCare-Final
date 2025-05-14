const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  recommendations: [{
    type: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema); 