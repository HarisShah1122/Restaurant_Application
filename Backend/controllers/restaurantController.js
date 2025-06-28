const { Restaurant } = require('../models/restaurant');
  const { validateSearchQuery, validateFilters } = require('../helpers/validation');
  const { Op } = require('sequelize');
  const jwt = require('jsonwebtoken');
  const config = { jwtSecret: '8Kj9mPq2v' }; 

  const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    try {
      jwt.verify(token, config.jwtSecret);
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid token.' });
    }
  };

  module.exports = (app) => {
    
    app.post('/restaurants', authenticate, async (req, res) => {
      try {
        const { name, cuisine, location, rating, images } = req.body;
        if (!name || !cuisine || !location || !rating || !images || images.length > 30) {
          return res.status(400).json({ error: 'All fields are required, and images must not exceed 30' });
        }
        const newRestaurant = await Restaurant.create({ name, cuisine, location, rating, images });
        res.status(201).json(newRestaurant);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    
    app.get('/restaurants', authenticate, validateSearchQuery, validateFilters, async (req, res) => {
      try {
        const { query = '', cuisine, location, rating } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (query) whereClause.name = { [Op.like]: `%${query}%` };
        if (cuisine) whereClause.cuisine = cuisine;
        if (location) whereClause.location = location;
        if (rating) whereClause.rating = { [Op.gte]: rating };

        const { count, rows } = await Restaurant.findAndCountAll({
          where: whereClause,
          limit,
          offset,
          order: [['rating', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);
        res.json({
          data: rows,
          currentPage: page,
          totalPages,
          totalItems: count,
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    app.get('/restaurants/:id', authenticate, async (req, res) => {
      try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(restaurant);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    
    app.put('/restaurants/:id', authenticate, async (req, res) => {
      try {
        const { name, cuisine, location, rating, images } = req.body;
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        if (images && images.length > 30) return res.status(400).json({ error: 'Images must not exceed 30' });

        await restaurant.update({ name, cuisine, location, rating, images });
        res.json(restaurant);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    app.delete('/restaurants/:id', authenticate, async (req, res) => {
      try {
        const restaurant = await Restaurant.findByPk(req.params.id);
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        await restaurant.destroy();
        res.status(204).json();
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });


    app.get('/suggestions', authenticate, validateSearchQuery, async (req, res) => {
      try {
        const { query = '' } = req.query;

        const suggestions = await Restaurant.findAll({
          attributes: ['name'],
          where: { name: { [Op.like]: `%${query}%` } },
          limit: 5,
        });

        res.json(suggestions.map(s => s.name));
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  };