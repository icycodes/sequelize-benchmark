const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastActivatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
  }
);

User.addHook("beforeUpdate", (user) => {
  if (user.changed("status") && user.status === "active") {
    user.lastActivatedAt = new Date();
  }
});

const run = async () => {
  try {
    await sequelize.authenticate();

    await User.update(
      { status: "active" },
      {
        where: { status: "pending" },
        individualHooks: true,
      }
    );

    console.log("Updated users successfully");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
