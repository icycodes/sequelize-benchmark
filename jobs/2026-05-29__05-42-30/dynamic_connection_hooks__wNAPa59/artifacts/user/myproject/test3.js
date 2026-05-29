const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  pool: { max: 5, min: 0, idle: 10000 }
});

sequelize.beforeConnect(() => {
  console.log('beforeConnect hook triggered automatically');
});

sequelize.authenticate();
