import React from "react";
import DashboardAnnouncement from "./DashboardSection_Contents/DashboardAnnouncement";
import DashboardCalendar from "./DashboardSection_Contents/DashboardCalendar"; // Import the new calendar component

export default function DashboardSection({ sidebarOpen }) {
  return (
    <div className="flex flex-col grow space-y-6">
      <div className="flex desktop:flex-row laptop:flex-row justify-center space-x-6 tablet:flex-col phone:flex-col phone:space-x-0 phone:space-y-4 tablet:space-y-4 desktop:space-y-0 laptop:space-y-0">
        {/* Announcement Section */}
        <DashboardAnnouncement sidebarOpen={sidebarOpen} />

        {/* Calendar Section */}
        <div>
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}
