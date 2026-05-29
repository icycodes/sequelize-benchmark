const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  hooks: {
    beforeConnect: async (config) => {
      console.log('beforeConnect hook triggered automatically');
    }
  }
});

sequelize.authenticate();
