const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function main() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false,
  });

  // beforeConnect hook: asynchronously read password from token.txt
  sequelize.beforeConnect(async (config) => {
    const password = await fs.promises.readFile(
      path.join(__dirname, 'token.txt'),
      'utf8'
    );
    config.password = password.trim();
  });

  // Manually trigger the beforeConnect hook since SQLite dialect
  // bypasses the connection pool that normally fires this hook
  await sequelize.runHooks('beforeConnect', sequelize.config);

  try {
    // Authenticate (connection will use the password set by the hook)
    await sequelize.authenticate();

    // Print confirmation with the dynamically loaded password
    console.log(`Connected with password: ${sequelize.config.password}`);

    // Define User model
    const User = sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    // Sync models to database
    await sequelize.sync();

    // Insert a new user
    await User.create({ username: 'alice' });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

main();