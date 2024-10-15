import React from "react";
import DashboardAnnouncement from './DashboardSection_Contents/DashboardAnnouncement';
import DashboardCalendar from './DashboardSection_Contents/DashboardCalendar'; // Import the new calendar component
import DashboardPaymentOverview from './DashboardSection_Contents/DashboardPaymentOverview'; // Import the new calendar component


export default function DashboardSection({ sidebarOpen }) {
  return (
    <div className='flex flex-col grow space-y-6'>
      <div className='flex flex-row justify-center space-x-6'>
        {/* Announcement Section */}
        <DashboardAnnouncement sidebarOpen={sidebarOpen} />

        {/* Calendar Section */}
        <div>
          <DashboardCalendar />
        </div>
      </div>

      {/* Payment Overview Section - Adjust margin */}
      <div className='mt-4'>
        <DashboardPaymentOverview />
      </div>
    </div>
  );
}
