import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

export const searchRestaurants = async (query = '', filters = {}) => {
  const params = { ...filters, query };
  const response = await api.get('/restaurants', { params });
  return response.data.data;
};

export const getSuggestions = async (query) => {
  const response = await api.get('/suggestions', { params: { query } });
  return response.data;
};

export default api;