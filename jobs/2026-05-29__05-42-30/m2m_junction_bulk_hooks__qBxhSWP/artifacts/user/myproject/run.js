const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  name: DataTypes.STRING
});

const Role = sequelize.define('Role', {
  name: DataTypes.STRING
});

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  hooks: {
    beforeBulkCreate: (instances, options) => {
      fs.appendFileSync(path.join(__dirname, 'hooks.log'), 'Triggered beforeBulkCreate\n');
    },
    beforeBulkDestroy: (options) => {
      fs.appendFileSync(path.join(__dirname, 'hooks.log'), 'Triggered beforeBulkDestroy\n');
    }
  }
});

User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

async function run() {
  await sequelize.sync({ force: true });

  const user = await User.create({ name: 'Alice' });
  const role1 = await Role.create({ name: 'Admin' });
  const role2 = await Role.create({ name: 'User' });

  await user.addRoles([role1, role2]);
  await user.removeRole(role1);

  console.log('Operations completed');
}

run().catch(console.error);
