import React from 'react';
import { ShoppingFilled, FilterOutlined } from '@ant-design/icons';

export default function MarketplaceGraybar({ onToggleFilter }) {
  return (
    <div className="bg-white shadow-md flex items-center justify-between my-3 p-3 rounded-md overflow-hidden">
      <div className="flex items-center">
        <h1
          className="text-[#0C82B4] my-auto font-poppins desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px] phone:ml-1 capitalize"
        >
          Marketplace
        </h1>
        <ShoppingFilled className="flex desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4]" />
      </div>
      <button
        className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700"
        onClick={onToggleFilter}
      >
        <FilterOutlined className="mr-2" />
        Filters
      </button>
    </div>
  );
}
