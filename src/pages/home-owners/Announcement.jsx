import React from "react";
import Header from "../../components/Header";
import SidebarHomeOwners from "../../components/home-owners/Sidebar";
import AnnouncementGraybar from "../../components/home-owners/AnnouncementGraybar";
import AnnouncementSection from "../../components/home-owners/AnnouncementSection";

const Announcement = ({ announcement, setAnnouncement }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarHomeOwners />
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
