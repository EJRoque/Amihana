import React, {useState} from 'react'
import { ShoppingFilled } from '@ant-design/icons';

export default function MarketplaceGraybar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1">
            <h1 className={`text-[#0C82B4] my-auto font-poppins ${sidebarOpen ? "desktop:text-sm laptop:text-sm tablet:text-xs phone:text-[8px]" : "desktop:text-base laptop:text-base tablet:text-sm phone:text-[10px]"} phone:ml-1 capitalize`}>   
                Marketplace
            </h1>
            <ShoppingFilled className="flex desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4]" />

        

        </div>
      </div>
    </div>
  )
}
