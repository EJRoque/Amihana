import React from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/admin/Sidebar";
import EventsGraybar from "../../components/admin/EventsGraybar";
import EventsSection from "../../components/admin/EventsSection";

const Events = ({}) => {
    return (
<div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
    <Header />
    <div className="flex flex-grow">
        <SidebarAdmin />
        <div className="flex-grow flex flex-col ml-2">
            <EventsGraybar />
            <EventsSection />
            </div>
        </div>
    </div>
    );
};

export default Events;