import React from 'react';

const RestaurantCard = ({ restaurant }) => {
  const images = restaurant.images || [];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{restaurant.name}</h5>
        <p className="card-text"><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p className="card-text"><strong>Location:</strong> {restaurant.location}</p>
        <p className="card-text"><strong>Rating:</strong> {restaurant.rating} / 5</p>
        <p className="card-text"><strong>Description:</strong> {restaurant.description}</p>
        <p className="card-text"><strong>Price Range:</strong> {restaurant.priceRange}</p>
        <p className="card-text"><strong>Contact:</strong> {restaurant.contact}</p>
        <p className="card-text"><strong>Opening Hours:</strong> {restaurant.openingHours}</p>
        <p className="card-text"><strong>Menu:</strong> {restaurant.menu.join(', ')}</p>
        <div className="card-text">
          <strong>Reviews:</strong>
          <ul>
            {restaurant.reviews &&
              restaurant.reviews.map((review, index) => (
                <li key={index}>
                  {review.user}: {review.rating} / 5 - "{review.comment}"
                </li>
              ))}
          </ul>
        </div>
        <div className="d-flex flex-wrap">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${restaurant.name} Image ${index + 1}`}
              className="img-thumbnail m-1"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              onError={(e) => (e.target.src = 'https://www.spiceandcolour.com/wp-content/uploads/2020/06/receta-presentacion-biryani-de-pollo-01.jpg')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;