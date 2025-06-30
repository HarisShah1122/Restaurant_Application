import React from 'react';

function HomePage({ time, handleSearch, handleFilter, restaurants, loading }) {
  
  const restaurantImages = {
    "Islamabad Delight": "islamabadDelight1.jpg",
    "Karachi Spice": "karachispice1.jpg",
    "Lahore Grill": "lahoreGrill1.jpg",
    "Peshawar Tikka": "islamabadDelight1.jpg",

  };

  return (
    <div className="text-center">
      <h1 className="mb-3 text-primary">Welcome to Delights: Feast with Flavor</h1>
      <p>Explore our delicious Pakistani cuisine options.</p>
      <p>Current Time: {time.toLocaleTimeString()}</p>

      {loading ? (
        <p>Loading restaurants...</p>
      ) : (
        <div className="row mt-4">
          {restaurants.map((restaurant) => (
            <div className="col-md-4 mb-3" key={restaurant.id}>
              <div className="card h-100">
                <img
                  src={`/images/${restaurantImages[restaurant.name] || 'placeholder.png'}`}
                  className="card-img-top"
                  alt={restaurant.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{restaurant.name}</h5>
                  <p className="card-text">{restaurant.cuisine}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;