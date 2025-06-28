import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

// Mock data (replace with real API)
const mockRestaurants = [
  { id: 1, name: 'Karachi Spice', cuisine: 'Biryani', location: 'Karachi', rating: 4.5 },
  { id: 2, name: 'Lahore Grill', cuisine: 'Karahi', location: 'Lahore', rating: 4.2 },
  { id: 3, name: 'Peshawar Tikka', cuisine: 'Tikka', location: 'Peshawar', rating: 4.7 },
  { id: 4, name: 'Islamabad Delight', cuisine: 'Nihari', location: 'Islamabad', rating: 4.0 },
];

export const searchRestaurants = async (query, filters) => {
  let results = [...mockRestaurants];
  if (query) results = results.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
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