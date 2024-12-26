import React, { useState } from 'react';
import MarketplaceGraybar from './MarketplaceGraybar';

export default function MarketplaceSection() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Product data should look like this in the firebase
  const products = [
    {
      id: 1,
      name: 'Modern Sofa',
      price: 300,
      category: 'Furniture',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Dining Table',
      price: 500,
      category: 'Furniture',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'King-Size Bed',
      price: 800,
      category: 'Furniture',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 4,
      name: 'Microwave Oven',
      price: 200,
      category: 'Appliances',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 5,
      name: 'Air Conditioner',
      price: 700,
      category: 'Appliances',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 6,
      name: 'Wall Painting',
      price: 150,
      category: 'Decor',
      image: 'https://via.placeholder.com/150',
    },
  ];

  // Filter products based on the selected category
  const filteredProducts =
    selectedCategory === 'All Categories'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleToggleFilter = () => {
    setFilterVisible((prev) => !prev);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
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
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option>All Categories</option>
              <option>Furniture</option>
              <option>Appliances</option>
              <option>Decor</option>
            </select>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-4 gap-6 mt-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white shadow-md rounded-md p-3">
            <img
              src={product.image}
              alt={product.name}
              className="rounded-md w-full h-40 object-cover"
            />
            <h3 className="font-semibold text-lg mt-2">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md w-full">
              Contact Seller
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
