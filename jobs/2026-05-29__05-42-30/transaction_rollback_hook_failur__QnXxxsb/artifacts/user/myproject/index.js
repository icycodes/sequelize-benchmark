const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

// Define the User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Add beforeCreate hook that throws if username is "admin"
User.addHook('beforeCreate', (user, options) => {
  if (user.username === 'admin') {
    throw new Error('Username "admin" is not allowed');
  }
});

async function main() {
  // Synchronize the database
  await sequelize.sync({ force: true });

  try {
    // Attempt bulkCreate within a managed transaction with individualHooks enabled
    await sequelize.transaction(async (t) => {
      await User.bulkCreate(
        [{ username: 'user1' }, { username: 'admin' }, { username: 'user2' }],
        { transaction: t, individualHooks: true }
      );
    });
  } catch (err) {
    // Expected: the beforeCreate hook threw an error for "admin"
  }

  // Query the database for the total number of users
  const count = await User.count();
  console.log(`User count: ${count}`);

  await sequelize.close();
}

main();