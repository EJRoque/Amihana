import React, { useState, useEffect } from 'react';
import { CalendarFilled } from "@ant-design/icons";
import { Button } from 'antd';
import ReserveEventModal from '../Modals/ReserveEventModal';
import ReserveEventHomeowners from '../Modals/Events Forms/ReserveEventHomeowners';

export default function EventsBarHome() {
  const [openMod, setOpenMod] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#FFFF] flex items-center desktop:h-16 laptop:h-16 phone:h-10 desktop:m-3 laptop:m-3 tablet:m-2 phone:m-1 rounded-lg shadow-xl">
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center ml-3 desktop:space-x-3 laptop:space-x-3 phone:space-x-1">
          <h1 className="text-[#0C82B4] font-poppins desktop:text-xl laptop:text-lg phone:text-sm flex items-center">
            Events
          </h1>
          <CalendarFilled className="flex-1 mb-2 desktop:h-10 desktop:w-10 laptop:h-8 laptop:w-8 phone:h-6 phone:w-6 text-[#0C82B4] flex items-center" />
        </div>
        <div className="flex items-center space-x-2 desktop:space-x-4 laptop:space-x-3 phone:space-x-2">
          <Button 
            className="bg-[#0C82B4] text-white flex items-center desktop:h-8 laptop:h-8 phone:h-6 desktop:px-4 laptop:px-3 phone:px-2 rounded-lg"
            onClick={() => setOpenMod(true)}
          >
            {isMobile ? (
              <CalendarFilled className="inline" />
            ) : (
              <span className="inline font-poppins">Reserve Event</span>
            )}
          </Button>
       
          <ReserveEventModal
            openMod={openMod}
            setOpenMod={setOpenMod}
          >
            <ReserveEventHomeowners />
          </ReserveEventModal>
        </div>
      </div>
    </div>
  );
}
