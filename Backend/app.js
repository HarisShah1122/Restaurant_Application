require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

const validateImages = (req, res, next) => {
  const isRestaurantRoute = req.path === '/restaurants' || req.path.match(/^\/restaurants\/[^/]+$/);
  const isPostOrPut = ['POST', 'PUT'].includes(req.method);

  if (isRestaurantRoute && isPostOrPut) {
    try {
      const { images } = req.body;
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

const controllersPath = path.join(__dirname, 'controllers');
fs.readdirSync(controllersPath).forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const controller = require(path.join(controllersPath, file));
      if (controller.controller) {
        controller.controller(app);
      }
    } catch (error) {
      console.error(`Failed to load controller ${file}:`, error);
    }
  }
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const port = process.env.PORT || 8081;
sequelize.authenticate()
  .then(() => {
    return sequelize.sync({ force: false, alter: true }); // Add alter option for schema updates
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Database connection or sync failed:', error);
    process.exit(1);
  });