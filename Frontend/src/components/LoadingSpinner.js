import React from 'react';

function SearchFilter({ onSearch, onFilter }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    onSearch(query, {});
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input type="text" name="query" placeholder="Search restaurants..." className="form-control" />
      <button type="submit" className="btn btn-primary ms-2">Search</button>
    </form>
  );
}

export default SearchFilter;