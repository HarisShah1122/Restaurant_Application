import React from 'react';

function RestaurantCard({ restaurant }) {
  return (
    <div className="card mb-3 animate__animated animate__fadeIn">
      <img src={restaurant.image} alt={restaurant.name} className="card-img-top" style={{ height: '150px', objectFit: 'cover' }} />
      <div className="card-body">
        <h5 className="card-title">{restaurant.name}</h5>
        <p className="card-text">
          <i className="bi bi-utensils"></i> {restaurant.cuisine} | <i className="bi bi-geo-alt"></i> {restaurant.location} | <i className="bi bi-star-fill"></i> {restaurant.rating}
        </p>
      </div>
    </div>
  );
}

export default RestaurantCard;