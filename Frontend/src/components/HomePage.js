import React from 'react';

function HomePage({ time, handleSearch, handleFilter, restaurants, loading }) {
  return (
    <div className="text-center">
      <h1 className="mb-3 text-primary">Welcome to Delights: Feast with Flavor</h1>
      <p>Explore our delicious Pakistani cuisine options.</p>
      <p>Current Time: {time.toLocaleTimeString()}</p>

      {loading ? (
        <p>Loading restaurants...</p>
      ) : (
        <div className="row mt-4">
          {restaurants.length === 0 ? (
            <p>No restaurants found.</p>
          ) : (
            restaurants.map((restaurant) => {
              // Log problematic images field for debugging
              if (!Array.isArray(restaurant.images)) {
                console.warn(`Invalid images field for restaurant ${restaurant.name || 'Unknown'} (ID: ${restaurant._id || restaurant.id}):`, restaurant.images);
              }
              // Use the first image from the images array, or fallback to placeholder
              const imageSrc = Array.isArray(restaurant.images) && restaurant.images.length > 0 
                ? `http://localhost:8081/${restaurant.images[0]}`
                : '/images/placeholder.png';

              return (
                <div className="col-md-4 mb-3" key={restaurant._id || restaurant.id}>
                  <div className="card h-100">
                    <img
                      src={imageSrc}
                      className="card-img-top"
                      alt={restaurant.name || 'Restaurant'}
                      onError={(e) => (e.target.src = '/images/placeholder.png')}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name || 'Unknown'}</h5>
                      <p className="card-text">{restaurant.cuisine || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;