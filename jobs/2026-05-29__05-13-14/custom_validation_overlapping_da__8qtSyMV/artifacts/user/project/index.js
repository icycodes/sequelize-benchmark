const express = require("express");
const { Sequelize, DataTypes, Op } = require("sequelize");

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./reservations.sqlite",
  logging: false,
});

const Reservation = sequelize.define(
  "Reservation",
  {
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    validate: {
      endDateAfterStartDate() {
        if (!this.startDate || !this.endDate) {
          return;
        }
        if (new Date(this.endDate) <= new Date(this.startDate)) {
          throw new Error("endDate must be after startDate");
        }
      },
      async noOverlappingReservations() {
        if (!this.roomId || !this.startDate || !this.endDate) {
          return;
        }

        const overlap = await Reservation.findOne({
          where: {
            roomId: this.roomId,
            ...(this.id ? { id: { [Op.ne]: this.id } } : {}),
            [Op.and]: [
              { startDate: { [Op.lt]: this.endDate } },
              { endDate: { [Op.gt]: this.startDate } },
            ],
          },
        });

        if (overlap) {
          throw new Error("Reservation dates overlap with an existing reservation");
        }
      },
    },
  }
);

app.post("/reservations", async (req, res) => {
  try {
    const reservation = await Reservation.create({
      roomId: req.body.roomId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });

    return res.status(201).json(reservation);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: error.errors.map((entry) => entry.message).join(", "),
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/reservations", async (req, res) => {
  const reservations = await Reservation.findAll({
    order: [["startDate", "ASC"]],
  });
  res.json(reservations);
});

const start = async () => {
  await sequelize.sync();

  app.listen(3000, () => {
    console.log("Reservation API listening on port 3000");
  });
};

start();
