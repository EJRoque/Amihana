import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MenuOutlined, NotificationFilled, HomeFilled,  
} from '@ant-design/icons';
import balancesheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import cashflowLogo from "../../assets/icons/cash-flow-logo.svg";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
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
      default:
        return "1";
    }
  };

  const isMobile = windowWidth < 375;

  return (
    <div
      className={`transition-all ease-in-out duration-300 bg-white shadow-lg ${
        collapsed ? (isMobile ? "w-0" : "w-16") : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <h1
          className={`font-medium text-gray-600 transition-opacity duration-300 ${
            collapsed || isMobile ? "opacity-0 hidden" : "opacity-100 block"
          } text-base md:text-lg lg:text-xl`}
        >
          Menu
        </h1>
        {!isMobile && (
          <MenuOutlined
            className="cursor-pointer transform transition-transform duration-300"
            style={{ fontSize: '1.5rem', color: "#0C82B4", }}
            onClick={toggleSidebar}
          />
        )}
      </div>
        {/* ICONS */}
      <ul className="flex flex-col overflow-y-auto m-0 p-0">

        <li 
          className={`p-4 flex items-center hover:bg-gray-100 ${
            selectedKey() === "1" && "bg-slate-50"
          } transition-colors duration-300`}
        >
            <Link 
              to="/dashboard-home-owners" 
              className="flex items-center w-full transition-transform duration-300 hover:scale-105"
            >
            <HomeFilled 
              className="mr-4 h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 transition-transform duration-300"
              style={{ fontSize: '1.5rem', color: "#0C82B4", }}
            />
            <span 
              className={`${collapsed ? "hidden" : "block"} text-base md:text-lg lg:text-xl transition-opacity duration-300`}
            >
                 Dashboard 
            </span>
            </Link>
        </li>
        
        <li
          className={`p-4 flex items-center hover:bg-gray-100 ${
            selectedKey() === "2" && "bg-gray-200"
          } transition-colors duration-300`}
        >
          <Link
            to="/balance-sheet-home-owners"
            className="flex items-center w-full transition-transform duration-300 hover:scale-105"
          >
            <img
              src={balancesheetLogo}
              alt="Balance sheet Logo"
              className="mr-4 h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 transition-transform duration-300"
            />
            <span
              className={`${collapsed ? "hidden" : "block"} text-base md:text-lg lg:text-xl transition-opacity duration-300`}
            >
              Balance sheet
            </span>
          </Link>
        </li>

        <li
          className={`p-4 flex items-center hover:bg-gray-100 ${
            selectedKey() === "3" && "bg-gray-200"
          } transition-colors duration-300`}
        >
          <Link
            to="/cash-flow-home-owners"
            className="flex items-center w-full transition-transform duration-300 hover:scale-105"
          >
            <img
              src={cashflowLogo}
              alt="Cash flow Logo"
              className="mr-4 h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 transition-transform duration-300"
            />
            <span
              className={`${collapsed ? "hidden" : "block"} text-base md:text-lg lg:text-xl transition-opacity duration-300`}
            >
              Cash flow record
            </span>
          </Link>
        </li>

        <li
          className={`p-4 flex items-center hover:bg-gray-100 ${
            selectedKey() === "4" && "bg-gray-200"
          } transition-colors duration-300`}
        >
          <Link
            to="/income-state-home-owners"
            className="flex items-center w-full transition-transform duration-300 hover:scale-105"
          >
            <img
              src={incomestatementLogo}
              alt="Income statement Logo"
              className="mr-4 h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 transition-transform duration-300"
            />
            <span
              className={`${collapsed ? "hidden" : "block"} text-base md:text-lg lg:text-xl transition-opacity duration-300`}
            >
              Income statement
            </span>
          </Link>
        </li>

        <li
          className={`p-4 flex items-center hover:bg-gray-100 ${
            selectedKey() === "5" && "bg-gray-200"
          } transition-colors duration-300`}
        >
          <Link
            to="/announcement-home-owners"
            className="flex items-center w-full transition-transform duration-300 hover:scale-105"
          >
            <NotificationFilled
           className="mr-4 h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 transition-transform duration-300"
            style={{ fontSize: '1.5rem', color: "#0C82B4", }}
            />
            <span
              className={`${collapsed ? "hidden" : "block"} text-base md:text-lg lg:text-xl transition-opacity duration-300`}
            >
              Announcement
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
};

export default Layout;
