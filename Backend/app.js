require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');
const config = require('./config');

const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const controllersPath = path.join(__dirname, 'controllers');
fs.readdirSync(controllersPath).forEach(file => {
  if (file.endsWith('.js')) {
    const controller = require(path.join(controllersPath, file));
    if (controller.controller) {
      controller.controller(app);
      console.log(`Loaded controller: ${file}`);
    } else {
      console.warn(`Skipped: ${file} does not export a controller function.`);
    }
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.port || 8081;
sequelize.sync({ force: false }).then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Database connection failed:', error);
});
