const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes, Model } = require("sequelize");

const databasePath = path.join(__dirname, "database.sqlite");
const hooksLogPath = path.join(__dirname, "hooks.log");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: databasePath,
  logging: false,
});

class User extends Model {}
class Role extends Model {}
class UserRole extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "User" }
);

Role.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "Role" }
);

UserRole.init(
  {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    RoleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "UserRole",
    hooks: {
      beforeBulkCreate() {
        fs.appendFileSync(hooksLogPath, "Triggered beforeBulkCreate\n");
      },
      beforeBulkDestroy() {
        fs.appendFileSync(hooksLogPath, "Triggered beforeBulkDestroy\n");
      },
    },
  }
);

User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

async function run() {
  await sequelize.sync({ force: true });

  const user = await User.create({ name: "Ada" });
  const [roleAdmin, roleEditor] = await Role.bulkCreate([
    { name: "Admin" },
    { name: "Editor" },
  ]);

  await user.addRoles([roleAdmin, roleEditor]);
  await user.removeRole(roleAdmin);

  console.log("Operations completed");
  await sequelize.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
