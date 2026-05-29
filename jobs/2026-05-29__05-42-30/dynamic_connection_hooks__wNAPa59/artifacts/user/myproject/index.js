const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

sequelize.beforeConnect(async (config) => {
  const tokenPath = path.join(__dirname, 'token.txt');
  let password = await fs.readFile(tokenPath, 'utf8');
  password = password.replace(/\r?\n$/, ''); // remove trailing newline if any
  config.password = password;
  console.log(`Connected with password: ${config.password}`);
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

async function main() {
  try {
    // Manually trigger the beforeConnect hook
    await sequelize.runHooks('beforeConnect', sequelize.config);

    await sequelize.sync({ force: true });
    await User.create({ username: 'alice' });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
