import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MenuOutlined,
  HomeFilled,
  DollarCircleFilled,
  LineChartOutlined,
  ContainerFilled,
  NotificationFilled,
  CalendarFilled,
} from "@ant-design/icons";

export default function MobileSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLinkClick = () => {
    setCollapsed(true); // Ensure the sidebar collapses when a link is clicked
  };

  const selectedKey = () => {
    switch (location.pathname) {
      case "/dashboard-home-owners":
        return "1";
      case "/balance-sheet-home-owners":
        return "2";
      case "/cash-flow-home-owners":
        return "3";
      case "/income-state-home-owners":
        return "4";
      case "/announcement-home-owners":
        return "5";
      case "/events-home-owners":
        return "6";
      default:
        return "1";
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-2 right-2 bg-[#0C82B4] h-8 w-8 flex justify-center z-50">
        <MenuOutlined
          className="text-white transition-transform duration-[1000ms]"
          onClick={toggleSidebar}
        />
      </div>
      <div
       className={`fixed top-12 right-0 bg-white shadow-lg rounded-b-xl transition-all ease-in-out duration-300 
        ${collapsed ? 
          "w-full h-0  pointer-events-none" :                       
          "w-full h-[80vh] pointer-events-auto"}
        sm:w-[320px] md:w-[360px] lg:w-[400px]`}
        style={{ overflow: 'hidden' }}
      >
        <ul className="flex flex-col space-y-4 p-4">
          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "1" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/dashboard-home-owners"
              className="flex items-center w-full"
              onClick={handleLinkClick}
            >
              <HomeFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span
                className={`transition-all duration-500 ${
                  collapsed
                    ? "opacity-0 translate-x-[-50px] hidden"
                    : "opacity-100 translate-x-0 block"
                }`}
              >
                Dashboard
              </span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "2" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/balance-sheet-home-owners"
              className="flex items-center w-full"
              onClick={handleLinkClick}
            >
              <DollarCircleFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span
                className={`transition-all duration-500 ${
                  collapsed
                    ? "opacity-0 translate-x-[-50px] hidden"
                    : "opacity-100 translate-x-0 block"
                }`}
              >
                Balance Sheet
              </span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "3" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/cash-flow-home-owners"
              className="flex items-center w-full"
              onClick={handleLinkClick}
            >
              <LineChartOutlined className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span
                className={`transition-all duration-500 ${
                  collapsed
                    ? "opacity-0 translate-x-[-50px] hidden"
                    : "opacity-100 translate-x-0 block"
                }`}
              >
                Cash Flow Record
              </span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "4" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/income-state-home-owners"
              className="flex items-center w-full"
              onClick={handleLinkClick}
            >
              <ContainerFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span
                className={`transition-all duration-500 ${
                  collapsed
                    ? "opacity-0 translate-x-[-50px] hidden"
                    : "opacity-100 translate-x-0 block"
                }`}
              >
                Income Statement
              </span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "5" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/announcement-home-owners"
              className="flex items-center w-full"
              onClick={handleLinkClick}
            >
              <NotificationFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span
                className={`transition-all duration-500 ${
                  collapsed
                    ? "opacity-0 translate-x-[-50px] hidden"
                    : "opacity-100 translate-x-0 block"
                }`}
              >
                Announcement
              </span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "6" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/events-home-owners"
              className="flex items-center w-full"
              onClick={handleLinkClick}
            >
              <CalendarFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span
                className={`transition-all duration-500 ${
                  collapsed
                    ? "opacity-0 translate-x-[-50px] hidden"
                    : "opacity-100 translate-x-0 block"
                }`}
              >
                Events
              </span>
            </Link>
          </li>
          {/* Profile */}
          <div className="w-[50vh] h-[2vh]">     
          </div>
          <div className="bg-slate-100 w-[50vh] h-[15vh] rounded-lg shadow-lg flex items-center justify-start space-x-0 ">
                <div className="rounded-full bg-slate-400 w-20 h-20 m-4"></div>
                <div className="w-32 h-20 space-y-2 flex flex-col justify-center">
                  <div className="w-28 h-8 bg-black rounded-lg"></div>
                  <div className="w-28 h-5 bg-black rounded-lg"></div>
                </div>
          </div>
        </ul>
                
      </div>
    </div>
  );
}
