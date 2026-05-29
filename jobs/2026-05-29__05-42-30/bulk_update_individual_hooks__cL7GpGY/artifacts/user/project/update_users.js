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
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastActivatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeUpdate: (user, options) => {
      if (user.changed('status') && user.status === 'active') {
        user.lastActivatedAt = new Date();
      }
    }
  }
});

async function run() {
  await sequelize.sync({ force: true });

  await User.bulkCreate([
    { username: 'user1', status: 'pending' },
    { username: 'user2', status: 'pending' },
    { username: 'user3', status: 'active' }
  ]);

  await User.update(
    { status: 'active' },
    { 
      where: { status: 'pending' },
      individualHooks: true
    }
  );

  console.log('Updated users successfully');
}

run().catch(console.error);
