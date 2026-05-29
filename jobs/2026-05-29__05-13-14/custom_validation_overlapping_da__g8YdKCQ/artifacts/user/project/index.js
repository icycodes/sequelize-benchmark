const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Reservation = sequelize.define('Reservation', {
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  validate: {
    checkDates() {
      if (new Date(this.startDate) >= new Date(this.endDate)) {
        throw new Error('endDate must be strictly after startDate');
      }
    },
    async checkOverlap() {
      if (!this.startDate || !this.endDate || !this.roomId) return;
      if (new Date(this.startDate) >= new Date(this.endDate)) return; // Already handled by checkDates
      
      const whereClause = {
        roomId: this.roomId,
        startDate: {
          [Op.lt]: this.endDate
        },
        endDate: {
          [Op.gt]: this.startDate
        }
      };
      
      if (this.id) {
        whereClause.id = { [Op.ne]: this.id };
      }

      const overlapping = await sequelize.models.Reservation.findOne({
        where: whereClause
      });

      if (overlapping) {
        throw new Error('Reservation dates overlap with an existing reservation');
      }
    }
  }
});

app.post('/reservations', async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.body;
    const reservation = await Reservation.create({ roomId, startDate, endDate });
    res.status(201).json(reservation);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(400).json({ error: error.message });
  }
});

app.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;

sequelize.sync().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
