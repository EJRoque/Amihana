import React, { useState } from 'react';
import MarketplaceGraybar from './MarketplaceGraybar';

export default function MarketplaceSection() {
  const [filterVisible, setFilterVisible] = useState(false);

  // Placeholder for product data
  const products = [
    {
      id: 1,
      name: 'Modern Sofa',
      price: 300,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Dining Table',
      price: 500,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'King-Size Bed',
      price: 800,
      image: 'https://via.placeholder.com/150',
    },
  ];

  const handleToggleFilter = () => {
    setFilterVisible((prev) => !prev);
  };

  return (
    <div className="bg-gray-100 p-4">
      {/* Graybar */}
      <MarketplaceGraybar onToggleFilter={handleToggleFilter} />

      {/* Filter Sidebar */}
      {filterVisible && (
        <div className="absolute top-20 left-0 bg-white shadow-md w-64 h-full p-4 z-10">
          <h2 className="font-semibold text-lg mb-3">Filters</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Category</label>
            <select className="border rounded-md px-3 py-2 w-full">
              <option>All Categories</option>
              <option>Furniture</option>
              <option>Appliances</option>
              <option>Decor</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Price Range</label>
            <input type="range" className="w-full" min="0" max="1000" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
            Apply Filters
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow-md rounded-md p-3">
            <img
              src={product.image}
              alt={product.name}
              className="rounded-md w-full h-40 object-cover"
            />
            <h3 className="font-semibold text-lg mt-2">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md w-full">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
