const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const databasePath = path.join(__dirname, "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: databasePath,
  logging: false,
  define: {
    hooks: {
      beforeCreate: (instance) => {
        instance.auditLog = "Created via global hook";
      }
    }
  }
});

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  auditLog: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Project = sequelize.define(
  "Project",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    auditLog: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    hooks: {
      beforeCreate: (instance) => {
        instance.auditLog = "Created via local hook";
      }
    }
  }
);

const outputPath = path.join(__dirname, "output.json");

const main = async () => {
  await sequelize.sync({ force: true });

  await User.create({ name: "Ada Lovelace" });
  await Project.create({ title: "Sequelize Hooks" });

  const users = await User.findAll({ raw: true });
  const projects = await Project.findAll({ raw: true });

  const output = { users, projects };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  await sequelize.close();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
