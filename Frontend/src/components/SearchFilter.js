import React, { useState, useEffect, useCallback } from 'react';
import { CFormInput, CFormSelect, CButton, CSpinner } from '@coreui/react';
import { getSuggestions } from '../services/api';

function SearchFilter({ onSearch }) {
  const [inputQuery, setInputQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', location: '', rating: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const mockRestaurants = [
    'Karachi Biryani House',
    'Lahore Karahi Spot',
    'Peshawar Tikka Haven',
    'Islamabad Delight',
  ];

  const fetchSuggestions = useCallback(async () => {
    if (inputQuery.length <= 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionLoading(false);
      return;
    }

    setSuggestionLoading(true);
    try {
      const data = await getSuggestions(inputQuery);
      setSuggestions(data.length > 0 ? data : mockRestaurants);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions(mockRestaurants);
      setShowSuggestions(true);
    } finally {
      setSuggestionLoading(false);
    }
  }, [inputQuery]);

  useEffect(() => {
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [fetchSuggestions]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(inputQuery, filters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, filters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      onSearch(inputQuery, newFilters);
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setInputQuery('');
    setFilters({ cuisine: '', location: '', rating: '' });
    onSearch('', { cuisine: '', location: '', rating: '' });
    setShowSuggestions(false);
  };

  return (
    <div className="mb-4">
      <div className="input-group mb-3 position-relative">
        <CFormInput
          type="text"
          placeholder="Search restaurants (e.g., Karachi Spice)..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onFocus={() => inputQuery.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {suggestionLoading && (
          <CSpinner color="primary" size="sm" className="position-absolute end-0 top-0 mt-2 me-2" />
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="list-group position-absolute w-100"
            style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onMouseDown={() => handleSuggestionClick(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <CButton color="primary" onClick={handleSearch}>
          Search
        </CButton>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <CFormSelect name="cuisine" value={filters.cuisine} onChange={handleFilterChange}>
            <option value="">All Cuisines</option>
            <option value="Biryani">Biryani</option>
            <option value="Karahi">Karahi</option>
            <option value="Tikka">Tikka</option>
            <option value="Nihari">Nihari</option>
          </CFormSelect>
        </div>
        <div className="col-md-4">
          <CFormSelect name="location" value={filters.location} onChange={handleFilterChange}>
            <option value="">All Locations</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Islamabad">Islamabad</option>
          </CFormSelect>
        </div>
        <div className="col-md-4">
          <CFormSelect name="rating" value={filters.rating} onChange={handleFilterChange}>
            <option value="">All Ratings</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </CFormSelect>
        </div>
      </div>
      <CButton color="secondary" onClick={handleClearFilters}>
        Clear Filters
      </CButton>
    </div>
  );
}

export default React.memo(SearchFilter);