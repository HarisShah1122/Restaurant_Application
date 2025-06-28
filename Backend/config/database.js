const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_NAME || 'restaurant.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit on connection failure
  });

module.exports = sequelize;