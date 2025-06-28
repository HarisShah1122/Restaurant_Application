import React from 'react';

const RestaurantList = ({ restaurants }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Restaurants List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td className="px-6 py-4 whitespace-nowrap">{restaurant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{restaurant.cuisine}</td>
                <td className="px-6 py-4 whitespace-nowrap">{restaurant.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{restaurant.rating}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {restaurant.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Restaurant ${restaurant.name} ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => (e.target.src = '/images/placeholder.png')}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RestaurantList;