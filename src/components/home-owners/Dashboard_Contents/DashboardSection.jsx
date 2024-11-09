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
          className="
          flex justify-between w-auto m-4 rounded-md shadow-md bg-white
          phone:justify-center phone:flex-col 
          tablet:flex-row tablet:justify-between"
        >
          <div className="w-screen phone:w-full tablet:w-3/4 p-4">
            <DashboardCalendar />
          </div>
          <div className="w-screen h-full bg-white rounded-md shadow-md">
          
          </div>
        </div>
      </div>
    </div>
  );
}
