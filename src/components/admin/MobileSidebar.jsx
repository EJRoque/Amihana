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
    
    toggleSidebar(); // Toggle sidebar
    setTimeout(() => {
    }, 500); // Adjust timing if necessary
  };

  const selectedKey = () => {
    switch (location.pathname) {
      case "/dashboard-admin":
        return "1";
      case "/balance-sheet-admin":
        return "2";
      case "/cash-flow-admin":
        return "3";
      case "/income-state-admin":
        return "4";
      case "/announcement-admin":
        return "5";
      case "/events-admin":
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
        className={`fixed top-12 right-0 bg-white shadow-lg rounded-md transition-all ease-in-out duration-300 
        ${collapsed ? "w-full h-0" : "w-full h-[100vh]"} 
        ${collapsed ? "opacity-0" : "opacity-100"} 
        sm:w-[320px] md:w-[360px] lg:w-[400px]`}
        style={{ transform: collapsed ? " " : " " }}
        >
        <ul className="flex flex-col space-y-4 p-4">
          <li
            className={`p-2 flex items-center hover:bg-gray-100 ${
              selectedKey() === "1" && "bg-slate-50"
            } transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            <Link
              to="/dashboard-admin"
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
              to="/balance-sheet-admin"
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
              to="/cash-flow-admin"
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
              to="/income-state-admin"
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
              to="/announcement-admin"
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
              to="/events-admin"
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
        </ul>
      </div>
    </div>
  );
}
