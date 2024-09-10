import React from 'react';
import Header from '../../components/Header';
import SidebarAdmin from '../../components/admin/Sidebar';
import DashboardNotifbar from '../../components/admin/Dashboard_Content/DashboardNotifbar';
import DashboardSection from '../../components/admin/Dashboard_Content/DashboardSection';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarAdmin />
        <div className="flex-grow flex flex-col mr-4">
          <DashboardNotifbar />
          <div className="flex-grow flex flex-col my-4">
            <DashboardSection />
        </div>
        </div>
        
      </div>
      
    </div>
  );
}
