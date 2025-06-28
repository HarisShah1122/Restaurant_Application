require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');
const { FoodPlace } = require('./models/restaurant');

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware to validate images for restaurant POST and PUT requests
const validateImages = (req, res, next) => {
  const isRestaurantRoute = req.path === '/restaurants' || req.path.match(/^\/restaurants\/[^/]+$/);
  const isPostOrPut = ['POST', 'PUT'].includes(req.method);

  if (isRestaurantRoute && isPostOrPut) {
    try {
      const { images } = req.body;
      console.log('Validating images:', images);
      if (!images) return res.status(400).json({ error: 'Images field is required' });
      if (!Array.isArray(images)) return res.status(400).json({ error: 'Images must be an array' });
      if (images.length < 1 || images.length > 30) return res.status(400).json({ error: 'Images must contain 1 to 30 items' });
      if (!images.every(item => typeof item === 'string' && item.trim().length > 0)) {
        return res.status(400).json({ error: 'Each image must be a non-empty string' });
      }
      req.body.images = images.map(item => item.trim());
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    next();
  }
};

app.use(validateImages);

// Load controllers
const controllersPath = path.join(__dirname, 'controllers');
fs.readdirSync(controllersPath).forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const controller = require(path.join(controllersPath, file));
      if (controller.controller) {
        controller.controller(app);
        console.log(`Loaded controller: ${file}`);
      } else {
        console.warn(`Skipped: ${file} does not export a controller function`);
      }
    } catch (error) {
      console.error(`Failed to load controller ${file}:`, error);
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
const port = process.env.PORT || 8081;
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database tables synced successfully');
    return sequelize.query('SELECT name FROM sqlite_master WHERE type="table" AND name="FoodPlaces"');
  })
  .then(([results]) => {
    if (results.length > 0) {
      console.log('Confirmed: FoodPlaces table exists');
    } else {
      console.log('FoodPlaces table not found, attempting manual creation');
      return sequelize.query(`
        CREATE TABLE FoodPlaces (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          cuisine TEXT NOT NULL,
          location TEXT NOT NULL,
          rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5),
          images TEXT NOT NULL
        )
      `);
    }
  })
  .then(() => {
    return sequelize.query('SELECT name FROM sqlite_master WHERE type="table" AND name="FoodPlaces"');
  })
  .then(([results]) => {
    if (results.length > 0) {
      console.log('Confirmed: FoodPlaces table created successfully');
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    } else {
      console.error('Error: FoodPlaces table was not created');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Database sync or table creation failed:', error);
    process.exit(1);
  });