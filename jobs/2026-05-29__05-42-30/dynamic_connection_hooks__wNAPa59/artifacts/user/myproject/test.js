const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:' });

sequelize.beforeConnect(() => {
  console.log('beforeConnect triggered');
});

sequelize.authenticate().then(() => console.log('authenticated'));
