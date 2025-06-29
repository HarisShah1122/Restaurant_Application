import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Restaurant from './components/restaurant';
import KarachiRestaurants from './components/KarachiRestaurants';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import HomePage from './components/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css/animate.min.css';
import { searchRestaurants } from './services/api';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [time, setTime] = useState(new Date());
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchInitialRestaurants();
    checkAuth();
    return () => clearInterval(timer);
  }, []);

  const fetchInitialRestaurants = async () => {
    setLoading(true);
    try {
      const data = await searchRestaurants('', { limit: 100 }); // Increase limit to fetch all
      setRestaurants(data);
    } catch (err) {
      console.error(err);
      // Fallback to initial data if API fails
      setRestaurants([]); // Adjust based on your fallback strategy
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query = '', filters = {}) => {
    setLoading(true);
    try {
      const data = await searchRestaurants(query, { ...filters, limit: 100 });
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = handleSearch;

  const checkAuth = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_URL}/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      setToken('');
      // Do not redirect on / or /restaurant
      if (window.location.pathname !== '/' && window.location.pathname !== '/restaurant') {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="container mt-4">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                time={time}
                handleSearch={handleSearch}
                handleFilter={handleFilter}
                restaurants={restaurants}
                loading={loading}
              />
            }
          />
          <Route
            path="/restaurant"
            element={
              <Restaurant
                restaurants={restaurants}
                setRestaurants={setRestaurants}
                loading={loading}
                setLoading={setLoading}
                token={token}
                setToken={setToken}
                user={isAuthenticated ? { id: 1, name: 'User' } : null} // Mock user
                initialRestaurants={restaurants}
                setInitialRestaurants={setRestaurants}
                handleSearch={handleSearch}
              />
            }
          />
          <Route path="/karachi" element={<KarachiRestaurants />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setToken={setToken} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/search" element={<Search handleSearch={handleSearch} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;