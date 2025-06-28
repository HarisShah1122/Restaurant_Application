const { FoodPlace, sequelize } = require('../models/restaurant');
const { validationResult } = require('express-validator');
const { validationRestaurant, validateSearchQuery, validateFilters } = require('../helpers/validation');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const config = { jwtSecret: '8Kj9mPq2v' };

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    jwt.verify(token, config.jwtSecret);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports.controller = (app) => {
  app.post('/restaurants', authenticate, validationRestaurant, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, cuisine, location, rating, images } = req.body;
      const newFoodPlace = await FoodPlace.create(
        { name, cuisine, location, rating, images },
        { transaction }
      );
      await transaction.commit();
      res.status(201).json(newFoodPlace);
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/all-restaurants', authenticate, async (req, res) => {
    try {
      const foodPlaces = await FoodPlace.findAll();
      res.json(foodPlaces);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/restaurants', authenticate, validateSearchQuery, validateFilters, async (req, res) => {
    try {
      const { query = '', cuisine, location, rating } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (query) whereClause.name = { [Op.like]: `%${query}%` };
      if (cuisine) whereClause.cuisine = cuisine;
      if (location) whereClause.location = location;
      if (rating) whereClause.rating = { [Op.gte]: rating };

      const { count, rows } = await FoodPlace.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['rating', 'DESC']]
      });

      res.json({
        data: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/restaurants/:id', authenticate, async (req, res) => {
    try {
      const foodPlace = await FoodPlace.findByPk(req.params.id);
      if (!foodPlace) return res.status(404).json({ error: 'Food place not found' });
      res.json(foodPlace);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/restaurants/:id', authenticate, validationRestaurant, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, cuisine, location, rating, images } = req.body;
      const foodPlace = await FoodPlace.findByPk(req.params.id, { transaction });
      if (!foodPlace) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Food place not found' });
      }
      await foodPlace.update({ name, cuisine, location, rating, images }, { transaction });
      await transaction.commit();
      res.json(foodPlace);
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/restaurants/:id', authenticate, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const foodPlace = await FoodPlace.findByPk(req.params.id, { transaction });
      if (!foodPlace) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Food place not found' });
      }
      await foodPlace.destroy({ transaction });
      await transaction.commit();
      res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/suggestions', authenticate, validateSearchQuery, async (req, res) => {
    try {
      const { query = '' } = req.query;
      const suggestions = await FoodPlace.findAll({
        attributes: ['name'],
        where: { name: { [Op.like]: `%${query}%` } },
        limit: 5
      });
      res.json(suggestions.map(s => s.name));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};