const express = require('express');
const { sequelize, Reservation } = require('./database');

const router = express.Router();

// POST /reservations - Create a new reservation
router.post('/reservations', async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.body;
    const reservation = await Reservation.create({ roomId, startDate, endDate });
    res.status(201).json(reservation);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e) => e.message);
      res.status(400).json({ error: messages.join('; ') });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /reservations - List all reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;