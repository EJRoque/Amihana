import React, { useState, useEffect } from "react";
import CostCon from '../../components/admin/CostControl'
import MobileSidebar from "../../components/admin/MobileSidebar";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";

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
  
export default function CostControl() {
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
          <div className="sticky top-16 h-full">
          <SidebarAdmin />  
          </div>
        )}          
          <div className="flex flex-col justify-center my-4 h-full w-full px-auto mx-4">
            <CostCon />
          </div>  
      </div>
    </div>
  )
}
