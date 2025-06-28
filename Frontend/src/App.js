import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import SearchFilter from './components/SearchFilter';
import RestaurantCard from './components/RestaurantCard';
import { searchRestaurants } from './services/api';

function HomePage({ time, handleSearch, handleFilter, restaurants, loading }) {
  return (
    <div className="container mt-5">
      <div
        className="hero text-center mb-5 animate__animated animate__fadeIn"
        style={{
          backgroundImage:
            'url("https://media.istockphoto.com/id/1457889029/photo/group-of-food-with-high-content-of-dietary-fiber-arranged-side-by-side.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '50px 20px',
          borderRadius: '10px',
          color: '#fff',
        }}
      >
        <h1 className="display-4 text-success" style={{ fontWeight: 'bold' }}>
          Desi Delights: Feast with Flavor!
        </h1>
        <p className="lead text-muted" style={{ fontWeight: 'bold' }}>
          Savor authentic Pakistani cuisine –{' '}
          {time.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' })},{' '}
          {time.toLocaleDateString('en-PK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />
      </div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {!loading && restaurants.length > 0 && (
        <div className="row">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="col-md-3">
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
