const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { body, validationResult } = require('express-validator');

// Get user appointments
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user })
      .populate('doctor', 'firstName lastName specialization')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', [
  auth,
  body('doctor').isMongoId(),
  body('date').isISO8601(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('type').isIn(['video', 'in-person', 'phone']),
  body('symptoms').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor, date, time, type, symptoms } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Check if doctor is available on that day and time
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isAvailable = doctorExists.availability.some(slot => 
      slot.day === dayOfWeek && 
      slot.startTime <= time && 
      slot.endTime >= time
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    // Create appointment
    const appointment = new Appointment({
      user: req.user,
      doctor,
      date,
      time,
      type,
      symptoms,
      payment: {
        amount: doctorExists.consultationFee,
        status: 'pending'
      }
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.patch('/:id/status', [
  auth,
  body('status').isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = req.body.status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add prescription to appointment
router.post('/:id/prescription', [
  auth,
  body('medications').isArray(),
  body('medications.*.name').trim().notEmpty(),
  body('medications.*.dosage').trim().notEmpty(),
  body('medications.*.frequency').trim().notEmpty(),
  body('medications.*.duration').trim().notEmpty(),
  body('instructions').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user // Only doctor can add prescription
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.prescription = {
      medications: req.body.medications,
      instructions: req.body.instructions
    };

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 