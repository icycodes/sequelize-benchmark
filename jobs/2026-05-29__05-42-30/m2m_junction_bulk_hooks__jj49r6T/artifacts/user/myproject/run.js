const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'hooks.log');

function appendLog(text) {
  fs.appendFileSync(logPath, text + '\n');
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

// Define UserRole junction model with hooks
const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  UserId: {
    type: DataTypes.INTEGER,
  },
  RoleId: {
    type: DataTypes.INTEGER,
  },
}, {
  hooks: {
    beforeBulkCreate(records, options) {
      appendLog('Triggered beforeBulkCreate');
    },
    beforeBulkDestroy(options) {
      appendLog('Triggered beforeBulkDestroy');
    },
  },
});

// Define User model
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define Role model
const Role = sequelize.define('Role', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Set up Many-to-Many associations
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

async function run() {
  // Clear any previous log file
  if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
  }

  // Sync the database
  await sequelize.sync({ force: true });

  // Create a user and two roles
  const user = await User.create({ name: 'Alice' });
  const role1 = await Role.create({ name: 'Admin' });
  const role2 = await Role.create({ name: 'Editor' });

  // Use addRoles mixin to assign both roles to the user
  await user.addRoles([role1, role2]);

  // Use removeRole mixin to remove one role from the user
  await user.removeRole(role1);

  console.log('Operations completed');

  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});