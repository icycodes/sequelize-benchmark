const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Parse command-line argument
const usersJson = process.argv[2];
const users = JSON.parse(usersJson);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

// Define User model
const User = sequelize.define('User', {
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
    defaultValue: 'pending',
  },
}, {
  hooks: {
    beforeCreate: (user) => {
      user.password = user.password + '-hashed';
    },
    beforeUpdate: (user) => {
      user.status = user.status + '-updated';
    },
  },
});

async function main() {
  await sequelize.sync({ force: true });

  await sequelize.transaction(async (t) => {
    // Insert users using bulkCreate with individualHooks
    await User.bulkCreate(users, { transaction: t, individualHooks: true });

    // Update all users to have status 'active' with individualHooks
    await User.update(
      { status: 'active' },
      { where: {}, transaction: t, individualHooks: true }
    );
  });

  console.log('Transaction complete.');

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});