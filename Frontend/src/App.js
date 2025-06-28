import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import SearchFilter from './components/SearchFilter';
import RestaurantCard from './components/RestaurantCard';
import { searchRestaurants } from './services/api';
import logo from './assets/logo.png';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [time, setTime] = useState(new Date());
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async (query = '', filters = {}) => {
    setLoading(true);
    try {
      const data = await searchRestaurants(query, filters);
      setRestaurants(data.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = handleSearch;

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="container mt-5">
        <div className="hero text-center mb-5 animate__animated animate__fadeIn">
          <h1 className="display-4 text-success">Welcome to Desi Diner!</h1>
          <p className="lead text-muted">
            Savor authentic Pakistani cuisine – {time.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' })}, {time.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />
        </div>
        {loading && <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>}
        {!loading && restaurants.length > 0 && (
          <div className="row">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-md-3">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        )}
        {!loading && restaurants.length === 0 && <p className="text-center">No restaurants found. Try searching!</p>}
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div />} /> {/* Empty for welcome page content above */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;