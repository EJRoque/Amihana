import React from "react";
import DashboardAnnouncement from './DashboardSection_Contents/DashboardAnnouncement';

export default function DashboardSection({ sidebarOpen }) {
  return (
    <div className='flex flex-row justify-center grow'>
      {/* Pass sidebarOpen to DashboardAnnouncement */}
      <DashboardAnnouncement sidebarOpen={sidebarOpen} />
    </div>
  );
}
