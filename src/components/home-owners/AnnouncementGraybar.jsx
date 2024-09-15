import React, { useState } from "react";
import { NotificationFilled } from '@ant-design/icons';

const AnnouncementGraybar = ({ announcement, setAnnouncement }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={`bg-white shadow-md flex items-center justify-end my-3 p-3 rounded-md overflow-hidden ${sidebarOpen ? 'desktop:h-14 laptop:h-14 tablet:h-12 phone:h-10' : 'desktop:h-16 laptop:h-16 tablet:h-14 phone:h-12'} desktop:mx-3 laptop:mx-3 tablet:mx-2 phone:mx-1`}>
      <div className="flex items-center justify-between w-full desktop:p-2 laptop:p-2 tablet:p-2">
        <div className="flex items-center desktop:space-x-2 laptop:space-x-2 phone:space-x-1"> 
          <h1 className="text-[#0C82B4] my-auto font-poppins desktop:text-lg laptop:text-lg tablet:text-sm phone:text-[10px] phone:ml-1">
            Announcement
          </h1>
          <NotificationFilled 
          alt="Announcement Logo"
          className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-4 phone:w-4" 
          style={{ fontSize: '1.5rem', color: "#0C82B4", }}
            />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementGraybar;
