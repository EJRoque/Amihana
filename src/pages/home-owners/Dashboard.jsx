import React from 'react'
import Header from "../../components/Header";
import SidebarHomeOwners from "../../components/home-owners/Sidebar";
import DashboardBar from '../../components/home-owners/Dashboard_Contents/DashboardBar';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-blue-200">
        <Header />
            <div className="flex flex-grow">
                <SidebarHomeOwners />     
            <div className="flex-grow flex flex-col ml-2">
                <DashboardBar/>
            </div>
            </div>
            
    </div>
  )
}
