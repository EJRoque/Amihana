import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarHomeOwner from "../../components/home-owners/Sidebar";
import AnnouncementGraybar from "../../components/home-owners/AnnouncementGraybar";
import AnnouncementSection from "../../components/home-owners/AnnouncementSection";
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

const Announcement = ({ announcement, setAnnouncement }) => {
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
          <SidebarHomeOwner />
        )}
        <div className="flex-grow flex flex-col ml-1">
          <AnnouncementGraybar
            announcement={announcement}
            setAnnouncement={setAnnouncement}
          />
          <AnnouncementSection announcement={announcement} />
        </div>
      </div>
    </div>
  );
};

export default Announcement;
