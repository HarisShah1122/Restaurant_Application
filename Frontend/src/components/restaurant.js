import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import LoadingSpinner from './LoadingSpinner';
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
  const [searchQuery, setSearchQuery] = useState(''); 
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchRestaurants();
  }, [page, user, searchQuery]); 

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
        params: { page, limit: 2, query: searchQuery }, 
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
      setShowModal(false); 
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mt-5">
      <h2
        className="text-center mb-4 gradient-text animate__animated animate__fadeInDown"
        style={{
          fontWeight: 'bold',
          fontFamily: "'Roboto Slab', 'Arial Black', 'sans-serif'",
          background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeInDown 1.2s ease-in-out',
        }}
      >
        Desi Delights: Feast with Flavor!
      </h2>
      <p className="lead text-muted text-center">
        {new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' })}, {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      {user ? (
        <>
          <div className="text-end mb-3">
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            <button className="btn btn-primary ms-2" onClick={() => setShowModal(true)}>Add Restaurant</button>
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by restaurant name..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <form onSubmit={saveRestaurant} className="mb-5" style={{ display: showModal ? 'block' : 'none' }}>
            <div className="modal" tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Restaurant</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <input type="text" className="form-control" name="name" value={newRestaurant.name} onChange={handleInputChange} placeholder="Restaurant Name" required />
                    </div>
                    <div className="mb-3">
                      <input type="text" className="form-control" name="cuisine" value={newRestaurant.cuisine} onChange={handleInputChange} placeholder="Cuisine" required />
                    </div>
                    <div className="mb-3">
                      <input type="text" className="form-control" name="location" value={newRestaurant.location} onChange={handleInputChange} placeholder="Location" required />
                    </div>
                    <div className="mb-3">
                      <input type="number" className="form-control" name="rating" value={newRestaurant.rating} onChange={handleInputChange} placeholder="Rating (0-5)" min="0" max="5" step="0.1" required />
                    </div>
                    <div className="mb-3">
                      <input type="file" className="form-control" multiple onChange={handleImageChange} accept="image/png,image/jpeg" />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">Save Restaurant</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <form onSubmit={updateRestaurant} className="mb-5" style={{ display: selectedRestaurant ? 'block' : 'none' }}>
            <h3>Update Restaurant</h3>
            <div className="mb-3">
              <input type="text" className="form-control" name="name" value={selectedRestaurant ? selectedRestaurant.name : ''} onChange={handleInputChange} placeholder="Restaurant Name" required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" name="cuisine" value={selectedRestaurant ? selectedRestaurant.cuisine : ''} onChange={handleInputChange} placeholder="Cuisine" required />
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" name="location" value={selectedRestaurant ? selectedRestaurant.location : ''} onChange={handleInputChange} placeholder="Location" required />
            </div>
            <div className="mb-3">
              <input type="number" className="form-control" name="rating" value={selectedRestaurant ? selectedRestaurant.rating : ''} onChange={handleInputChange} placeholder="Rating (0-5)" min="0" max="5" step="0.1" required />
            </div>
            <div className="mb-3">
              <input type="file" className="form-control" multiple onChange={handleImageChange} accept="image/png,image/jpeg" />
            </div>
            <button type="submit" className="btn btn-primary">Update Restaurant</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => setSelectedRestaurant(null)}>Cancel</button>
          </form>
          <div className="row">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <div key={restaurant.id} className="col-md-6 mb-3">
                  <RestaurantCard restaurant={restaurant} />
                  <button className="btn btn-warning w-100 mb-1" onClick={() => setSelectedRestaurant(restaurant)}>Edit</button>
                  <button className="btn btn-danger w-100" onClick={() => deleteRestaurant(restaurant.id)}>Delete</button>
                </div>
              ))
            ) : (
              <p className="text-center">No restaurants found for "{searchQuery}".</p>
            )}
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
      ) : (
        <div className="text-center">
          <p>Please <a href="/login">login</a> to view restaurants.</p>
        </div>
      )}
    </div>
  );
}

export default Restaurant;