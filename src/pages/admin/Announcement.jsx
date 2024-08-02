import React from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import AnnouncementGraybar from "../../components/admin/AnnouncementGraybar";
import AnnouncementSection from "../../components/admin/AnnouncementSection";

const Announcement = ({ announcement, setAnnouncement }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
      <Header />
      <div className="flex flex-grow">
        <SidebarAdmin />
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
