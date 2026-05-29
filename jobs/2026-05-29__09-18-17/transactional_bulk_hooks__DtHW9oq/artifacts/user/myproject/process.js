const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

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
    beforeCreate: (user, options) => {
      user.password = user.password + '-hashed';
    },
    beforeUpdate: (user, options) => {
      user.status = user.status + '-updated';
    },
  },
});

async function main() {
  try {
    const usersJson = process.argv[2];
    if (!usersJson) {
      console.error('Please provide a JSON string of users.');
      process.exit(1);
    }

    const usersData = JSON.parse(usersJson);

    await sequelize.sync({ force: true });

    await sequelize.transaction(async (t) => {
      await User.bulkCreate(usersData, {
        individualHooks: true,
        transaction: t,
      });

      await User.update(
        { status: 'active' },
        {
          where: {},
          individualHooks: true,
          transaction: t,
        }
      );
    });

    console.log('Transaction complete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

main();
