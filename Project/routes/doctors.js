const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const { body, validationResult } = require('express-validator');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { specialization, rating, experience } = req.query;
    let query = {};

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    const doctors = await Doctor.find(query)
      .select('-reviews')
      .sort({ rating: -1, experience: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor details
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add doctor review
router.post('/:id/reviews', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const { rating, comment } = req.body;

    // Check if user has already reviewed
    const existingReview = doctor.reviews.find(
      review => review.user.toString() === req.user.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }

    // Add review
    doctor.reviews.push({
      user: req.user,
      rating,
      comment
    });

    // Update average rating
    const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0);
    doctor.rating = totalRating / doctor.reviews.length;

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor availability
router.get('/:id/availability', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor.availability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 