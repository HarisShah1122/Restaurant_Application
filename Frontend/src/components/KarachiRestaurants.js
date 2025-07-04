import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchFilter from './SearchFilter';
import RestaurantList from './RestaurantList';
import Toast from './Toast';
import LoadingSpinner from './LoadingSpinner';

function KarachiRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    location: 'Karachi',
    rating: '',
    images: [],
  });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const cuisines = ['Biryani', 'Karahi', 'Tikka', 'Nihari', 'Pulao', 'Haleem', 'Chapli', 'Seekh', 'Qorma', 'Samosa'];
  const locations = ['Karachi', 'Clifton', 'Gulshan', 'Defence', 'Saddar'];
  const ratings = [3.0, 3.5, 4.0, 4.5, 5.0];
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setToast({ show: true, message: 'Please log in to view restaurants' });
      navigate('/login');
      return;
    }
    fetchRestaurants();
  }, [token]);

  const fetchRestaurants = async (query = '', filters = {}) => {
    setLoading(true);
    try {
      console.log('Fetching restaurants with token:', token); // Debug log
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = new URL('http://localhost:8081/restaurants/search');
      const params = new URLSearchParams({ ...filters, location: 'Karachi', query, limit: 10, page: 1 });
      url.search = params.toString();

      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.error || error.message;
      setToast({ show: true, message: `Error fetching restaurants: ${errorMessage}` });
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 30);
    setFormData((prev) => ({ ...prev, images: files }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!formData.name || !formData.cuisine || !formData.location || !formData.rating) {
      setFormError('Name, Cuisine, Location, and Rating are required');
      setFormLoading(false);
      return;
    }

    if (!token) {
      setFormError('Please log in to add a restaurant');
      setFormLoading(false);
      navigate('/login');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('cuisine', formData.cuisine);
      payload.append('location', formData.location);
      payload.append('rating', parseFloat(formData.rating));
      formData.images.forEach((file) => payload.append('images', file));

      console.log('Submitting restaurant with data:', Object.fromEntries(payload));
      const response = await axios.post('http://localhost:8081/restaurants', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setRestaurants((prev) => [...prev, response.data]);
      setToast({ show: true, message: 'Restaurant added successfully!' });
      setFormData({ name: '', cuisine: '', location: 'Karachi', rating: '', images: [] });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding restaurant:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.status === 401
          ? 'Please log in to add a restaurant'
          : error.response?.status === 403
          ? 'Invalid or expired session. Please log in again.'
          : error.response?.data?.errors
          ? error.response.data.errors.map((err) => err.msg).join(', ')
          : error.response?.data?.error || 'Failed to add restaurant';
      setFormError(errorMessage);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = (query, filters) => {
    fetchRestaurants(query, filters);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Karachi Restaurants</h1>
      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Restaurant
        </button>
      </div>
      <SearchFilter onSearch={handleSearch} onFilter={handleSearch} />
      <RestaurantList restaurants={restaurants} />
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
      {showModal && (
        <div className="modal" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Restaurant</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                ></button>
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}
                {formLoading && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g., Karachi Spice"
                        required
                        disabled={formLoading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Cuisine</label>
                      <select
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                        disabled={formLoading}
                      >
                        <option value="">Select Cuisine</option>
                        {cuisines.map((cuisine) => (
                          <option key={cuisine} value={cuisine}>
                            {cuisine}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Location</label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                        disabled={formLoading}
                      >
                        <option value="">Select Location</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Rating (0-5)</label>
                      <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                        disabled={formLoading}
                      >
                        <option value="">Select Rating</option>
                        {ratings.map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Images (optional, up to 30, PNG/JPEG, ≤5MB each)</label>
                      <input
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        className="form-control"
                        accept="image/png,image/jpeg"
                        disabled={formLoading}
                      />
                      {formData.images.length > 0 && (
                        <div className="mt-2">
                          <p>Selected files: {formData.images.length}</p>
                          <ul className="list-group">
                            {formData.images.map((file, index) => (
                              <li key={index} className="list-group-item">
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer mt-4">
                    <button type="submit" className="btn btn-primary" disabled={formLoading}>
                      Save Restaurant
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={() => setShowModal(false)}
                      disabled={formLoading}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KarachiRestaurants;