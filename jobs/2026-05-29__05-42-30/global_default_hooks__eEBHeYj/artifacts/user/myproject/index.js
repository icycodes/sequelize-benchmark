const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/home/user/myproject/database.sqlite',
  define: {
    hooks: {
      beforeCreate: (instance, options) => {
        instance.auditLog = 'Created via global hook';
      }
    }
  }
});

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  auditLog: DataTypes.STRING
});

const Project = sequelize.define('Project', {
  title: DataTypes.STRING,
  auditLog: DataTypes.STRING
}, {
  hooks: {
    beforeCreate: (instance, options) => {
      instance.auditLog = 'Created via local hook';
    }
  }
});

async function run() {
  await sequelize.sync({ force: true });

  await User.create({ name: 'Alice' });
  await Project.create({ title: 'Project X' });

  const users = await User.findAll();
  const projects = await Project.findAll();

  const output = {
    users: users.map(u => u.toJSON()),
    projects: projects.map(p => p.toJSON())
  };

  fs.writeFileSync('/home/user/myproject/output.json', JSON.stringify(output, null, 2));
}

run().catch(console.error);
