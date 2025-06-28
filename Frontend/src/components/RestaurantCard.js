import React from 'react';

const RestaurantCard = ({ restaurant }) => {
  const images = restaurant.images || [];
  const BASE_IMAGE_URL = '/public'; 

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{restaurant.name}</h5>
        <p className="card-text">Cuisine: {restaurant.cuisine}</p>
        <p className="card-text">Location: {restaurant.location}</p>
        <p className="card-text">Rating: {restaurant.rating}</p>
        <div className="d-flex flex-wrap">
          {images.map((image, index) => (
            <img
              key={index}
              src={`${BASE_IMAGE_URL}${image}`}
              alt={`${restaurant.name} Image ${index + 1}`}
              className="img-thumbnail m-1"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              onError={(e) => (e.target.src = '/images/burgergarage.jpg')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;