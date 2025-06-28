import React, { useState, useEffect } from 'react';
import { getSuggestions } from '../services/api';

function SearchFilter({ onSearch, onFilter }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', location: '', rating: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 1) {
        const data = await getSuggestions(query);
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, filters);
    setShowSuggestions(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    onFilter({ ...filters, [name]: value });
  };

  return (
    <div className="mb-5">
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search restaurants (e.g., Karachi Spice)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onMouseDown={() => { setQuery(suggestion); setShowSuggestions(false); onSearch(suggestion, filters); }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <button className="btn btn-primary" type="button" onClick={handleSearch}>
          <i className="bi bi-search"></i> Search
        </button>
      </div>
      <div className="row g-3">
        <div className="col-md-4">
          <select className="form-select" name="cuisine" value={filters.cuisine} onChange={handleFilterChange}>
            <option value="">All Cuisines</option>
            <option value="Biryani">Biryani</option>
            <option value="Karahi">Karahi</option>
            <option value="Tikka">Tikka</option>
            <option value="Nihari">Nihari</option>
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" name="location" value={filters.location} onChange={handleFilterChange}>
            <option value="">All Locations</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Islamabad">Islamabad</option>
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" name="rating" value={filters.rating} onChange={handleFilterChange}>
            <option value="">All Ratings</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default SearchFilter;