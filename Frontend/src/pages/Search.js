import React, { useState, useEffect } from 'react';
import SearchFilter from '../components/SearchFilter';
import RestaurantCard from '../components/RestaurantCard';
import { searchRestaurants } from '../services/api';
import Toast from '../components/Toast';

function Search() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const itemsPerPage = 2;

  const fetchRestaurants = async (query = '', filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await searchRestaurants(query, filters);
      const total = Math.ceil(data.length / itemsPerPage);
      setTotalPages(total);
      setRestaurants(data.slice(0, itemsPerPage));
    } catch (err) {
      setError('Failed to fetch restaurants');
      setToastMessage('Failed to fetch restaurants');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      const start = (newPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setRestaurants(mockRestaurants.slice(start, end));
      setPage(newPage);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-success">Explore Desi Delights</h2>
      <SearchFilter onSearch={fetchRestaurants} onFilter={fetchRestaurants} />
      {loading && <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && restaurants.length === 0 && <p className="text-center">No restaurants found.</p>}
      {!loading && restaurants.length > 0 && (
        <>
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
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
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
    </div>
  );
}

export default Search;