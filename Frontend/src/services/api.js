import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

// Mock data with detailed fields and updated image paths
const mockRestaurants = [
  { 
    id: 1, 
    name: 'Karachi Spice', 
    cuisine: 'Biryani', 
    location: 'Karachi', 
    rating: 4.5,
    images: ['/images/karachispice.jpg'],
    description: 'A renowned spot for authentic Biryani with a rich blend of spices.',
    priceRange: '$$$', 
    contact: '+92-321-1234567',
    openingHours: '10:00 AM - 11:00 PM',
    menu: ['Chicken Biryani', 'Mutton Biryani', 'Vegetable Biryani'],
    reviews: [
      { user: 'Ali', rating: 4.5, comment: 'Best Biryani in town!' },
      { user: 'Sara', rating: 4.0, comment: 'Great taste, a bit pricey.' }
    ]
  },
  { 
    id: 2, 
    name: 'Lahore Grill', 
    cuisine: 'Karahi', 
    location: 'Lahore', 
    rating: 4.2,
    images: ['/images/lahoreGrill.jpg'],
    description: 'Famous for its sizzling Karahi dishes prepared with fresh ingredients.',
    priceRange: '$$', 
    contact: '+92-322-7654321',
    openingHours: '11:00 AM - 10:00 PM',
    menu: ['Chicken Karahi', 'Mutton Karahi', 'Beef Karahi'],
    reviews: [
      { user: 'Ahmed', rating: 4.2, comment: 'Love the spices!' },
      { user: 'Zainab', rating: 4.0, comment: 'Good service.' }
    ]
  },
  { 
    id: 3, 
    name: 'Peshawar Tikka', 
    cuisine: 'Tikka', 
    location: 'Peshawar', 
    rating: 4.7,
    images: ['/images/peshawarTikka.jpg'],
    description: 'Specializes in juicy Tikka with traditional charcoal grilling.',
    priceRange: '$$$', 
    contact: '+92-333-4567890',
    openingHours: '12:00 PM - 12:00 AM',
    menu: ['Chicken Tikka', 'Beef Tikka', 'Mutton Tikka'],
    reviews: [
      { user: 'Hassan', rating: 4.7, comment: 'Perfect Tikka experience!' },
      { user: 'Fatima', rating: 4.6, comment: 'Highly recommended.' }
    ]
  },
  { 
    id: 4, 
    name: 'Islamabad Delight', 
    cuisine: 'Nihari', 
    location: 'Islamabad', 
    rating: 4.0,
    images: ['/images/islamabadDelight.jpg'],
    description: 'A cozy place offering slow-cooked Nihari with rich flavors.',
    priceRange: '$$', 
    contact: '+92-334-9876543',
    openingHours: '9:00 AM - 9:00 PM',
    menu: ['Beef Nihari', 'Mutton Nihari', 'Chicken Nihari'],
    reviews: [
      { user: 'Omar', rating: 4.0, comment: 'Tasty but slow service.' },
      { user: 'Ayesha', rating: 3.9, comment: 'Good Nihari.' }
    ]
  },
];

export const searchRestaurants = async (query, filters) => {
  let results = [...mockRestaurants];
  if (query) {
    const exactMatch = results.find(r => r.name.toLowerCase() === query.toLowerCase());
    if (exactMatch) {
      results = [exactMatch]; // Return only the exact match with all details
    } else {
      results = results.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    }
  }
  if (filters.cuisine) results = results.filter(r => r.cuisine === filters.cuisine);
  if (filters.location) results = results.filter(r => r.location === filters.location);
  if (filters.rating) results = results.filter(r => r.rating >= filters.rating);
  return new Promise((resolve) => setTimeout(() => resolve(results), 500)); // Simulate delay
};

export const getSuggestions = async (query) => {
  if (!query) return [];
  return mockRestaurants
    .filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    .map(r => r.name)
    .slice(0, 5); // Top 5 suggestions
};

export default api;