const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  define: {
    hooks: {
      beforeCreate: (record) => {
        record.auditLog = 'Created via global hook';
      }
    }
  }
});

const User = sequelize.define('User', {
  auditLog: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Project = sequelize.define('Project', {
  auditLog: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (record) => {
      record.auditLog = 'Created via local hook';
    }
  }
});

async function main() {
  await sequelize.sync({ force: true });

  await User.create({});
  await Project.create({});

  const users = await User.findAll();
  const projects = await Project.findAll();

  const output = {
    users: users.map(u => u.toJSON()),
    projects: projects.map(p => p.toJSON())
  };

  fs.writeFileSync(
    path.join(__dirname, 'output.json'),
    JSON.stringify(output, null, 2)
  );

  console.log('Output written to output.json');
  await sequelize.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});