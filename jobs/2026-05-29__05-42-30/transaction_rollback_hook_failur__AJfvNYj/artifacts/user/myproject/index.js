const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: (user, options) => {
      if (user.username === 'admin') {
        throw new Error('Admin creation is not allowed');
      }
    }
  }
});

async function run() {
  try {
    await sequelize.sync({ force: true });

    try {
      await sequelize.transaction(async (t) => {
        await User.bulkCreate([
          { username: 'user1' },
          { username: 'admin' },
          { username: 'user2' }
        ], {
          transaction: t,
          individualHooks: true
        });
      });
    } catch (error) {
      // Caught the expected error from the hook
    }

    const count = await User.count();
    console.log(`User count: ${count}`);
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    await sequelize.close();
  }
}

run();
