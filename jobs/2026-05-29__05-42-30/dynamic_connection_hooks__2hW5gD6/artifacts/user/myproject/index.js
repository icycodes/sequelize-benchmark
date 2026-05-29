const fs = require("fs/promises");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const databasePath = path.join(__dirname, "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: databasePath,
  logging: false,
});

let loadedPassword = "";

sequelize.beforeConnect(async (config) => {
  const tokenPath = path.join(__dirname, "token.txt");
  const password = await fs.readFile(tokenPath, "utf8");
  loadedPassword = password;
  config.password = password;
});

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const run = async () => {
  await sequelize.sync();

  await User.create({ username: "alice" });

  console.log(`Connected with password: ${loadedPassword}`);

  await sequelize.close();
};

run().catch((error) => {
  console.error("Failed to run Sequelize script:", error);
  process.exitCode = 1;
});
