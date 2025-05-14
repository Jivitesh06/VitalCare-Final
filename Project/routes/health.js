const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Get all health records for a user
router.get('/records', auth, async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user })
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new health record
router.post('/analyze', [
  auth,
  body('symptoms').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symptoms } = req.body;

    // Here you would typically integrate with an AI service
    // For now, we'll use mock data
    const mockAnalysis = {
      diagnosis: 'Common Cold',
      urgency: 'low',
      recommendations: [
        'Get plenty of rest',
        'Stay hydrated',
        'Take over-the-counter cold medicine if needed'
      ],
      medications: [
        {
          name: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed'
        }
      ]
    };

    const healthRecord = new HealthRecord({
      user: req.user,
      symptoms,
      ...mockAnalysis
    });

    await healthRecord.save();
    res.json(healthRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medication reminders
router.get('/medications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('medications');
    res.json(user.medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add medication reminder
router.post('/medications', [
  auth,
  body('name').trim().notEmpty(),
  body('dosage').trim().notEmpty(),
  body('frequency').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, frequency } = req.body;

    const user = await User.findById(req.user);
    user.medications.push({
      name,
      dosage,
      frequency,
      startDate: new Date()
    });

    await user.save();
    res.json(user.medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 