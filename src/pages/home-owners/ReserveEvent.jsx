import React from 'react'
import Header from "../../components/Header";
import SidebarHomeOwner from "../../components/home-owners/Sidebar";
import EventsBarHome from '../../components/home-owners/EventsBarHome';
import EventsSection from '../../components/home-owners/EventsSection';

export default function ReserveEvent() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
        <Header />
        <div className="flex flex-grow">
            <SidebarHomeOwner />
            <div className="flex-grow flex flex-col ml-2">
                <EventsBarHome />
                <EventsSection />
            </div>
        </div>        
    </div>
  )
}
