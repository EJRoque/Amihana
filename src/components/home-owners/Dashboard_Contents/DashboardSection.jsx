import React from "react";
import DashboardAnnouncement from "./DashboardSection_Contents/DashboardAnnouncement";
import DashboardCalendar from "./DashboardSection_Contents/DashboardCalendar"; // Import the new calendar component

export default function DashboardSection({ sidebarOpen }) {
  return (
    <div className="flex flex-col grow space-y-6">
      <div className="bg-red flex flex-col w-full h-auto justify-center space-y-6">
        {/* Announcement Section */}
        <DashboardAnnouncement sidebarOpen={sidebarOpen} />
        <div
          className="flex desktop:flex-row laptop:flex-row desktop:justify-between laptop:justify-between 
                     phone:flex-col tablet:flex-col items-center w-full"
        >
          <div className="w-[45%] phone:w-full tablet:w-3/4 m-auto p-4">
            <DashboardCalendar />
          </div>
          <div className="w-[45%] phone:w-full tablet:w-3/4 m-auto p-4">
          {/* placeholder i want to put a notification tab here or something else */}
            <DashboardCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}
