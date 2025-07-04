import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchFilter from './SearchFilter';
import Toast from './Toast';
import LoadingSpinner from './LoadingSpinner';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [filters, setFilters] = useState({ query: '', cuisine: '', location: '', rating: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) {
      setToast({ show: true, message: 'Please log in to view restaurants' });
      navigate('/login');
      return;
    }
    fetchRestaurants();
  }, [token, page, filters]);

  const fetchRestaurants = async (query = '', filterValues = {}) => {
    setLoading(true);
    try {
      console.log('Fetching restaurants with token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = new URL('http://localhost:8081/restaurants/search');
      const params = new URLSearchParams({ ...filterValues, query, limit: 10, page });
      url.search = params.toString();

      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalize restaurant data
      const restaurantData = response.data.data || response.data.restaurants || [];
      const normalizedRestaurants = restaurantData.map((restaurant) => {
        // Handle invalid images field (string or non-array)
        let normalizedImages = [];
        const validImageRegex = /^[0-9a-zA-Z._-]+\.(jpg|jpeg|png)$/; // Validate filename format
        if (Array.isArray(restaurant.images)) {
          normalizedImages = restaurant.images
            .map((img) => img.replace(/^\/?(public\/images\/|uploads\/|uploads\/images\/|Ipublicluploads\/)/, 'public/uploads/images/'))
            .filter((img) => {
              const isValid = validImageRegex.test(img.split('/').pop());
              if (!isValid) {
                console.warn(`Invalid image filename for ${restaurant.name || 'Unknown'} (ID: ${restaurant._id || restaurant.id}):`, img);
              }
              return isValid;
            });
        } else if (typeof restaurant.images === 'string') {
          console.warn(`Converting string images to array for restaurant ${restaurant.name || 'Unknown'} (ID: ${restaurant._id || restaurant.id}):`, restaurant.images);
          const normalizedPath = restaurant.images.replace(/^\/?(public\/images\/|uploads\/|uploads\/images\/|Ipublicluploads\/)/, 'public/uploads/images/');
          if (validImageRegex.test(normalizedPath.split('/').pop())) {
            normalizedImages = [normalizedPath];
          } else {
            console.warn(`Invalid image filename for ${restaurant.name || 'Unknown'} (ID: ${restaurant._id || restaurant.id}):`, normalizedPath);
          }
        } else {
          console.warn(`Invalid images field for restaurant ${restaurant.name || 'Unknown'} (ID: ${restaurant._id || restaurant.id}):`, restaurant.images);
        }

        const normalized = {
          ...restaurant,
          images: normalizedImages,
          _id: restaurant._id || restaurant.id || Math.random().toString(36).substring(2),
          id: restaurant._id || restaurant.id || Math.random().toString(36).substring(2),
          name: (restaurant.name || 'Unknown').trim(), // Trim whitespace
          cuisine: (restaurant.cuisine || 'N/A').trim(),
          location: (restaurant.location || 'N/A').trim().replace('chken', 'chicken'), // Fix typos
          rating: restaurant.rating || 0,
        };
        return normalized;
      });
      console.log('Normalized restaurants:', normalizedRestaurants);
      setRestaurants(normalizedRestaurants);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching restaurants:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch restaurants';
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

  const handleSearch = (query, filterValues) => {
    setFilters({ query, ...filterValues });
    setPage(1);
  };

  const handleFilter = (query, filterValues) => {
    setFilters({ query, ...filterValues });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-3 text-primary text-center">Welcome to Delights: Feast with Flavor</h1>
      <p className="text-center">Explore our delicious Pakistani cuisine options.</p>
      <p className="text-center">
        Current Time: {time.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' })}
      </p>

      <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="row mt-4">
          {restaurants.length === 0 ? (
            <p className="text-center">No restaurants found.</p>
          ) : (
            restaurants.map((restaurant) => (
              <div className="col-md-4 mb-3" key={restaurant._id || restaurant.id}>
                <div className="card h-100">
                  {restaurant.images.length > 0 ? (
                    <div id={`carousel-${restaurant._id || restaurant.id}`} className="carousel slide" data-bs-ride="carousel">
                      <div className="carousel-inner">
                        {restaurant.images.map((image, index) => (
                          <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <img
                              src={`http://localhost:8081/${image}`}
                              className="d-block w-100"
                              alt={`${restaurant.name || 'Restaurant'} - Image ${index + 1}`}
                              style={{ height: '200px', objectFit: 'cover' }}
                              onError={(e) => {
                                console.warn(`Failed to load image: http://localhost:8081/${image} for ${restaurant.name || 'Unknown'} (ID: ${restaurant._id || restaurant.id})`);
                                e.target.src = '/images/placeholder.png';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target={`#carousel-${restaurant._id || restaurant.id}`}
                        data-bs-slide="prev"
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target={`#carousel-${restaurant._id || restaurant.id}`}
                        data-bs-slide="next"
                      >
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                      </button>
                    </div>
                  ) : (
                    <img
                      src="/images/placeholder.png"
                      className="card-img-top"
                      alt={restaurant.name || 'Restaurant'}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{restaurant.name || 'Unknown'}</h5>
                    <p className="card-text">{restaurant.cuisine || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center mt-4">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(page - 1)}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <li key={num} className={`page-item ${page === num ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(num)}>
                {num}
              </button>
            </li>
          ))}
          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>

      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}

export default HomePage;