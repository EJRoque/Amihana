import React from "react";
import DashboardAnnouncement from "./DashboardSection_Contents/DashboardAnnouncement";

export default function DashboardSection({ sidebarOpen }) {
  return (
    <div className="space-y-6 w-full h-full">
      <div className="w-full h-full p-4">

        {/* Announcement Section */}
        <div className="bg-white rounded-md w-full p-4">
          <DashboardAnnouncement sidebarOpen={sidebarOpen} />
        </div>
        
      </div>
    </div>
  );
}
