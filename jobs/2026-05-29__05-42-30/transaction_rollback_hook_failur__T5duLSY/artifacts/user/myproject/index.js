const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        if (user.username === "admin") {
          throw new Error("admin is not allowed");
        }
      },
    },
  }
);

const run = async () => {
  await sequelize.sync({ force: true });

  try {
    await sequelize.transaction(async (transaction) => {
      await User.bulkCreate(
        [
          { username: "user1" },
          { username: "admin" },
          { username: "user2" },
        ],
        {
          transaction,
          individualHooks: true,
        }
      );
    });
  } catch (error) {
    console.error(`Bulk create failed: ${error.message}`);
  }

  const userCount = await User.count();
  console.log(`User count: ${userCount}`);

  await sequelize.close();
};

run().catch((error) => {
  console.error(`Unexpected failure: ${error.message}`);
});
