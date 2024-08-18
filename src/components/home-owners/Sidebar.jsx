import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuOutlined, NotificationFilled, HomeFilled, ContainerFilled, DollarCircleFilled, LineChartOutlined, CalendarFilled } from "@ant-design/icons";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
      case "/events-home-owners":
        return "6";
      default:
        return "1";
    }
  };

  return (
    <div
      className={`transition-all ease-in-out duration-500 bg-white shadow-lg ${
        collapsed ? "w-14" : "phone:w-36 tablet:w-48 laptop:w-60 desktop:w-64"
      } min-h-screen flex flex-col space-y-6 px-2 py-2`}
    >
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } transition-all duration-[1000ms]`}
      >
        <h1
          className={`font-medium text-gray-600 transition-all duration-[1000ms] ease-in-out transform ${
            collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
          } phone:text-sm tablet:text-base laptop:text-lg desktop:text-xl`}
        >
          Menu
        </h1>
        <MenuOutlined
          className={`ml-2 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-[1000ms] text-[#0C82B4] ${
            collapsed ? "transform translate-x-0" : "transform translate-x-2"
          }`}
          onClick={toggleSidebar}
        />
      </div>

      {/* Menu items */}
      <ul className="flex flex-col space-y-4">
        <li
          className={`p-2 flex items-center hover:bg-gray-100 ${
            selectedKey() === "1" && "bg-slate-50"
          } transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
          <Link to="/dashboard-home-owners" className="flex items-center w-full">
            <HomeFilled
              className="mr-4 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-300 text-[#0C82B4]"
            />
            <span
              className={`transition-all duration-[1000ms] ease-in-out transform ${
                collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
              } phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg`}
            >
              Dashboard
            </span>
          </Link>
        </li>

        <li
          className={`p-2 flex items-center hover:bg-gray-100 ${
            selectedKey() === "2" && "bg-gray-200"
          } transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
          <Link to="/balance-sheet-home-owners" className="flex items-center w-full">
            <DollarCircleFilled
              className="mr-4 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-300 text-[#0C82B4]"
            />
            <span
              className={`transition-all duration-[1000ms] ease-in-out transform ${
                collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
              } phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg`}
            >
              Balance sheet
            </span>
          </Link>
        </li>

        <li
          className={`p-2 flex items-center hover:bg-gray-100 ${
            selectedKey() === "3" && "bg-gray-200"
          } transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
          <Link to="/cash-flow-home-owners" className="flex items-center w-full">
            <LineChartOutlined 
              className="mr-4 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-300 text-[#0C82B4]"
            />
            <span
              className={`transition-all duration-[1000ms] ease-in-out transform ${
                collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
              } phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg`}
            >
              Cash flow record
            </span>
          </Link>
        </li>

        <li
          className={`p-2 flex items-center hover:bg-gray-100 ${
            selectedKey() === "4" && "bg-gray-200"
          } transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
          <Link to="/income-state-home-owners" className="flex items-center w-full">
            <ContainerFilled 
              className="mr-4 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-300 text-[#0C82B4]"
            />
            <span
              className={`transition-all duration-[1000ms] ease-in-out transform ${
                collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
              } phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg`}
            >
              Income statement
            </span>
          </Link>
        </li>

        <li
          className={`p-2 flex items-center hover:bg-gray-100 ${
            selectedKey() === "5" && "bg-gray-200"
          } transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
          <Link to="/announcement-home-owners" className="flex items-center w-full">
            <NotificationFilled
              className="mr-4 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-300 text-[#0C82B4]"
            />
            <span
              className={`transition-all duration-[1000ms] ease-in-out transform ${
                collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
              } phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg`}
            >
              Announcement
            </span>
          </Link>
        </li>
        <li
          className={`p-2 flex items-center hover:bg-gray-100 ${
            selectedKey() === "6" && "bg-gray-200"
          } transition-all duration-300 transform hover:scale-105 active:scale-95`}
        >
          <Link to="/events-home-owners" className="flex items-center w-full">
            <CalendarFilled
              className="mr-4 phone:h-6 phone:w-6 tablet:h-7 tablet:w-7 laptop:h-7 laptop:w-7 desktop:h-8 desktop:w-8 transition-transform duration-300 text-[#0C82B4]"
            />
            <span
              className={`transition-all duration-[1000ms] ease-in-out transform ${
                collapsed ? "opacity-0 translate-x-[-50px] hidden" : "opacity-100 translate-x-0 block"
              } phone:text-xs tablet:text-sm laptop:text-base desktop:text-lg`}
            >
              Events
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
