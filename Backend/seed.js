const { Restaurant, sequelize } = require('./src/models/restaurant');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
  await sequelize.sync({ force: false }); 
  const restaurants = [];
  const cuisines = ['Biryani', 'Karahi', 'Tikka', 'Nihari', 'Pulao', 'Haleem', 'Chapli', 'Seekh', 'Qorma', 'Samosa'];
  const locations = ['Karachi', 'Lahore', 'Peshawar', 'Islamabad', 'Multan', 'Faisalabad', 'Rawalpindi', 'Quetta', 'Hyderabad', 'Sialkot'];

  for (let i = 1; i <= 30; i++) {
    const name = `${locations[i % 10]}Delight${i}`;
    const cuisine = cuisines[i % 10];
    const location = locations[i % 10];
    const rating = (Math.random() * (5 - 3) + 3).toFixed(1);
    const images = Array.from({ length: 30 }, (_, j) => `/images/${name.toLowerCase().replace('delight', '')}${j + 1}.png`);
    restaurants.push({ id: uuidv4(), name, cuisine, location, rating, images });
  }

  await Restaurant.bulkCreate(restaurants);
  console.log('Database seeded with 30 restaurants!');
  process.exit();
};

seedData().catch(err => console.error(err));