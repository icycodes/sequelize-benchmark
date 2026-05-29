const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

const Reservation = sequelize.define('Reservation', {
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'roomId is required' },
    },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'startDate is required' },
      isDate: true,
    },
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'endDate is required' },
      isDate: true,
      isAfterStartDate(value) {
        if (this.startDate && value && value <= this.startDate) {
          throw new Error('endDate must be after startDate');
        }
      },
    },
  },
}, {
  validate: {
    async noOverlappingDates() {
      if (this.roomId && this.startDate && this.endDate) {
        const overlapping = await Reservation.findOne({
          where: {
            roomId: this.roomId,
            startDate: { [Sequelize.Op.lt]: this.endDate },
            endDate: { [Sequelize.Op.gt]: this.startDate },
          },
        });
        if (overlapping) {
          throw new Error('Reservation dates overlap with an existing reservation for this room');
        }
      }
    },
  },
});

module.exports = { sequelize, Reservation };