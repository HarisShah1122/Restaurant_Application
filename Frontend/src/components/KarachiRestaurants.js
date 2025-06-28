import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import SearchFilter from './SearchFilter';
import RestaurantList from './RestaurantList'; // Import the new component

function KarachiRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    location: 'Karachi', // Default to Karachi
    rating: '',
    images: [''],
  });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showModal, setShowModal] = useState(false); 
  const cuisines = ['Biryani', 'Karahi', 'Tikka', 'Nihari', 'Pulao', 'Haleem', 'Chapli', 'Seekh', 'Qorma', 'Samosa'];
  const locations = ['Karachi', 'Clifton', 'Gulshan', 'Defence', 'Saddar'];
  const ratings = [3.0, 3.5, 4.0, 4.5, 5.0];

  const fetchRestaurants = async (query = '', filters = {}) => {
    try {
      const url = new URL('http://localhost:8081/restaurants');
      const params = new URLSearchParams({ query, ...filters });
      url.search = params.toString();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer your-jwt-token',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setRestaurants(data.data);
    } catch (error) {
      setToast({ show: true, message: `Error fetching restaurants: ${error.message}` });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    if (formData.images.length < 30) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
    }
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ''),
      };
      const response = await fetch('http://localhost:8081/restaurants', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer your-jwt-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to add restaurant');
      const data = await response.json();
      setToast({ show: true, message: 'Restaurant added successfully!' });
      setFormData({ name: '', cuisine: '', location: 'Karachi', rating: '', images: [''] });
      fetchRestaurants();
      setShowModal(false); 
    } catch (error) {
      setToast({
        show: true,
        message: `Error adding restaurant: ${error.response?.data?.error || error.message}`,
      });
    }
  };

  const handleSearch = (query, filters) => {
    fetchRestaurants(query, filters);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Karachi Restaurants</h1>

      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Restaurant</button>
      </div>

      <SearchFilter onSearch={handleSearch} onFilter={handleSearch} />

    
      <RestaurantList restaurants={restaurants} />

      
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

    
      {showModal && (
        <div className="modal" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Restaurant</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="e.g., Karachi Spice"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                      <select
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      >
                        <option value="">Select Cuisine</option>
                        {cuisines.map((cuisine) => (
                          <option key={cuisine} value={cuisine}>{cuisine}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      >
                        <option value="">Select Location</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
                      <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                      >
                        <option value="">Select Rating</option>
                        {ratings.map((rating) => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Images (1-30)</label>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center mt-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                          placeholder="e.g., /images/karachi1.png"
                          required={index === 0}
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.images.length < 30 && (
                      <button
                        type="button"
                        onClick={addImageField}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        <i className="bi bi-plus-circle"></i> Add Image
                      </button>
                    )}
                  </div>
                  <div className="modal-footer mt-4">
                    <button type="submit" className="btn btn-primary">Save Restaurant</button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowModal(false)}>Close</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KarachiRestaurants;