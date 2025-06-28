const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const FoodPlace = sequelize.define('FoodPlace', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cuisine: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 5 },
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true,
      isValidImages(value) {
        if (!Array.isArray(value)) throw new Error('Images must be an array');
        if (value.length < 1 || value.length > 30) throw new Error('Images must contain 1 to 30 items');
        if (!value.every(item => typeof item === 'string' && item.trim().length > 0)) {
          throw new Error('Each image must be a non-empty string');
        }
      },
    },
  },
}, {
  timestamps: false,
  tableName: 'FoodPlaces',
});

module.exports = { FoodPlace, sequelize };