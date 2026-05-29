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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  lastActivatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Implement beforeUpdate hook
User.addHook('beforeUpdate', (user) => {
  if (user.changed('status') && user.status === 'active') {
    user.lastActivatedAt = new Date();
  }
});

async function main() {
  try {
    // Sync the model to create the table
    await sequelize.sync({ force: true });

    // Create sample users with 'pending' status
    await User.bulkCreate([
      { username: 'alice', status: 'pending' },
      { username: 'bob', status: 'pending' },
      { username: 'charlie', status: 'pending' },
      { username: 'dave', status: 'inactive' },
    ]);

    // Perform bulk update with individualHooks enabled to trigger beforeUpdate for each record
    await User.update(
      { status: 'active' },
      {
        where: { status: 'pending' },
        individualHooks: true,
      }
    );

    // Verify the update
    const users = await User.findAll();
    for (const user of users) {
      console.log(
        `User: ${user.username}, Status: ${user.status}, lastActivatedAt: ${user.lastActivatedAt}`
      );
    }

    console.log('Updated users successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

main();