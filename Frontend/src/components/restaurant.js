import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantCard from './restaurantCard';
import LoadingSpinner from './loadingSpinner';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8081/api';
const config = { jwtSecret: '8Kj9mPq2v' }; 

function Restaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', location: '', rating: '', images: [] });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchRestaurants();
  }, [page, user]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      setToken('');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/restaurants`, {
        params: { page, limit: 2 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      navigate('/restaurant');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (firstname, lastname, email, password, role = 'customer') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/signup`, { firstname, lastname, email, password, role });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      navigate('/restaurant');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_URL}/logout`, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem('token');
      setToken('');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant(prev => ({ ...prev, [name]: value }));
    if (selectedRestaurant) setSelectedRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 30);
    const imagePaths = files.map(file => `/images/${(selectedRestaurant ? selectedRestaurant.name : newRestaurant.name).toLowerCase()}_${file.name}`);
    if (selectedRestaurant) setSelectedRestaurant(prev => ({ ...prev, images: imagePaths }));
    else setNewRestaurant(prev => ({ ...prev, images: imagePaths }));
  };

  const saveRestaurant = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/restaurants`, {
        ...newRestaurant,
        rating: parseFloat(newRestaurant.rating),
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRestaurants();
      setNewRestaurant({ name: '', cuisine: '', location: '', rating: '', images: [] });
    } catch (error) {
      console.error('Error saving restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (e) => {
    e.preventDefault();
    if (!user || !selectedRestaurant) return;
    setLoading(true);
    try {
      await axios.put(`${API_URL}/restaurants/${selectedRestaurant.id}`, {
        ...selectedRestaurant,
        rating: parseFloat(selectedRestaurant.rating),
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRestaurants();
      setSelectedRestaurant(null);
    } catch (error) {
      console.error('Error updating restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/restaurants/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-success">Welcome to Desi Diner!</h2>
      <p className="lead text-muted text-center">
        {new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' })}, {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      {!user ? (
        <div>
          <h3>Login</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.email.value, e.target.password.value); }}>
            <input type="email" name="email" placeholder="Email" className="form-control mb-2" required />
            <input type="password" name="password" placeholder="Password" className="form-control mb-2" required />
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
          <h3>Signup</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSignup(e.target.firstname.value, e.target.lastname.value, e.target.email.value, e.target.password.value, e.target.role.value); }}>
            <input type="text" name="firstname" placeholder="First Name" className="form-control mb-2" required />
            <input type="text" name="lastname" placeholder="Last Name" className="form-control mb-2" required />
            <input type="email" name="email" placeholder="Email" className="form-control mb-2" required />
            <input type="password" name="password" placeholder="Password" className="form-control mb-2" required />
            <select name="role" className="form-control mb-2">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            <button type="submit" className="btn btn-primary">Signup</button>
          </form>
        </div>
      ) : (
        <>
          <div className="text-end mb-3">
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
          <form onSubmit={saveRestaurant} className="mb-5">
            <h3>{selectedRestaurant ? 'Update Restaurant' : 'Add New Restaurant'}</h3>
            <div className="mb-3">
              <input type="text" className="form-control" name="name" value={selectedRestaurant ? selectedRestaurant.name : newRestaurant.name} onChange={handleInputChange} placeholder="Restaurant Name" required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" name="cuisine" value={selectedRestaurant ? selectedRestaurant.cuisine : newRestaurant.cuisine} onChange={handleInputChange} placeholder="Cuisine" required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" name="location" value={selectedRestaurant ? selectedRestaurant.location : newRestaurant.location} onChange={handleInputChange} placeholder="Location" required />
            </div>
            <div className="mb-3">
              <input type="number" className="form-control" name="rating" value={selectedRestaurant ? selectedRestaurant.rating : newRestaurant.rating} onChange={handleInputChange} placeholder="Rating (0-5)" min="0" max="5" step="0.1" required />
            </div>
            <div className="mb-3">
              <input type="file" className="form-control" multiple onChange={handleImageChange} accept="image/png,image/jpeg" />
            </div>
            <button type="submit" className="btn btn-primary">{selectedRestaurant ? 'Update' : 'Save'} Restaurant</button>
            {selectedRestaurant && <button type="button" className="btn btn-secondary ms-2" onClick={() => setSelectedRestaurant(null)}>Cancel</button>}
          </form>
          <div className="row">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-md-6 mb-3">
                <RestaurantCard restaurant={restaurant} />
                <button className="btn btn-warning w-100 mb-1" onClick={() => setSelectedRestaurant(restaurant)}>Edit</button>
                <button className="btn btn-danger w-100" onClick={() => deleteRestaurant(restaurant.id)}>Delete</button>
              </div>
            ))}
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page - 1)}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <li key={num} className={`page-item ${page === num ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(num)}>{num}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default Restaurant;