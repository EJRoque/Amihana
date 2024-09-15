import React, { useState } from 'react';
import Header from "../../components/Header";
import SidebarHomeOwners from "../../components/home-owners/Sidebar";
import DashboardBar from '../../components/home-owners/Dashboard_Contents/DashboardBar';
import DashboardSection from '../../components/home-owners/Dashboard_Contents/DashboardSection';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // sidebar state

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarHomeOwners isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-grow flex flex-col ml-2">
          <DashboardBar />
          {/* Pass sidebarOpen to DashboardSection */}
          <DashboardSection sidebarOpen={sidebarOpen} />
        </div>
      </div>
    </div>
  );
}
