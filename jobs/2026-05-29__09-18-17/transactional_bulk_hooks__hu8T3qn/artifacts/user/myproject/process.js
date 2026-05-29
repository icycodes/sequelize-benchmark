const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const dbPath = path.join(__dirname, "database.sqlite");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.password = `${user.password}-hashed`;
      },
      beforeUpdate: (user) => {
        user.status = `${user.status}-updated`;
      },
    },
  }
);

const usersJson = process.argv[2];
if (!usersJson) {
  console.error("Usage: node process.js <users_json>");
  process.exit(1);
}

let usersInput;
try {
  usersInput = JSON.parse(usersJson);
} catch (error) {
  console.error("Invalid JSON input.");
  process.exit(1);
}

if (!Array.isArray(usersInput)) {
  console.error("Input must be a JSON array of user objects.");
  process.exit(1);
}

const run = async () => {
  await sequelize.sync({ force: true });

  await sequelize.transaction(async (transaction) => {
    await User.bulkCreate(usersInput, {
      individualHooks: true,
      transaction,
    });

    await User.update(
      { status: "active" },
      {
        where: {},
        individualHooks: true,
        transaction,
      }
    );
  });

  console.log("Transaction complete.");
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
