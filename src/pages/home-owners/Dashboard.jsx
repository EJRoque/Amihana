import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarHomeOwners from "../../components/home-owners/Sidebar";
import DashboardBar from "../../components/home-owners/Dashboard_Contents/DashboardBar";
import DashboardSection from "../../components/home-owners/Dashboard_Contents/DashboardSection";
import MobileSidebar from "../../components/home-owners/MobileSidebarHOA";

function useMobileView() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // sidebar state
  const isMobile = useMobileView();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        {isMobile ? (
          <div className="fixed top-0 right-0 z-50 m-2 ">
            <MobileSidebar />
          </div>
        ) : (
          <div className="sticky top-16 w-1/4 h-full"> {/* Sticky sidebar stays visible all the way down */}
            <SidebarHomeOwners
              isOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        )}
      
        <div className="flex-grow flex flex-col mx-4 phone:mx-2 laptop:mx-4 desktop:mx-6 overflow-hidden">
          <DashboardBar />
          <div className="flex-grow flex flex-col my-4">
            <DashboardSection sidebarOpen={sidebarOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}
