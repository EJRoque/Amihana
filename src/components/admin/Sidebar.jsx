import React, { useState } from "react";
import hamburgerMenu from "../../assets/icons/hamburger-menu.svg";
import homeLogo from "../../assets/icons/home-logo.svg";
import balancesheetLogo from "../../assets/icons/balance-sheet-logo.svg";
import cashflowLogo from "../../assets/icons/cash-flow-logo.svg";
import incomestatementLogo from "../../assets/icons/income-statement-logo.svg";
import announcementLogo from "../../assets/icons/announcement-logo.svg";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`min-h-screen ${
        isOpen ? "desktop:w-60 laptop:w-60 tablet:w-52 phone:w-46" : "w-14"
      } flex flex-col space-y-6 px-4 py-2 border-solid border-r-2 border-slate-400 shadow-2xl transition-width duration-300 bg-white`}
    >
      <div className="flex justify-between items-center">
        <h1
          className={`desktop:text-xl laptop:text-xl phone:text-md text-[#5D7285] font-medium font-poppins ${
            isOpen ? "" : "hidden"
          }`}
        >
          Menu
        </h1>
        <img
          src={hamburgerMenu}
          alt="Hamburger Menu"
          className="desktop:h-7 desktop:w-7 laptop:h-7 laptop:w-7 phone:h-6 phone:w-6 cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>

      <a href="">
        <div className="flex items-center border-b-2 rounded-md hover:bg-[#E9F5FE]">
          <img
            src={homeLogo}
            alt="Dashboard Logo"
            className="desktop:h-7 desktop:w-7 laptop:h-7 laptop:w-7 phone:h-5 phone:w-5 mr-1"
          />
          <h1
            className={`desktop:text-sm laptop:text-xs phone:text-[8px] text-[#5D7285] hover:text-[#0C82B4] font-base font-poppins ${
              isOpen ? "" : "hidden"
            }`}
          >
            Dashboard
          </h1>
        </div>
      </a>
      <a href="">
        <div className="flex items-center border-b-2 rounded-md hover:bg-[#E9F5FE]">
          <img
            src={balancesheetLogo}
            alt="Balance sheet Logo"
            className="desktop:h-7 desktop:w-7 laptop:h-7 laptop:w-7 phone:h-5 phone:w-5 mr-1"
          />
          <h1
            className={`desktop:text-sm laptop:text-xs phone:text-[8px] text-[#5D7285] hover:text-[#0C82B4] font-base font-poppins ${
              isOpen ? "" : "hidden"
            }`}
          >
            Balance sheet
          </h1>
        </div>
      </a>
      <a href="/cash-flow-admin">
        <div className="flex items-center border-b-2 rounded-md hover:bg-[#E9F5FE]">
          <img
            src={cashflowLogo}
            alt="Cash flow Logo"
            className="desktop:h-6 desktop:w-6 laptop:h-6 laptop:w-6 phone:h-5 phone:w-5 mr-1"
          />
          <h1
            className={`desktop:text-sm laptop:text-xs phone:text-[8px] text-[#5D7285] hover:text-[#0C82B4] font-base font-poppins ${
              isOpen ? "" : "hidden"
            }`}
          >
            Cash flow record
          </h1>
        </div>
      </a>
      <a href="/income-state-admin">
        <div className="flex items-center border-b-2 rounded-md hover:bg-[#E9F5FE]">
          <img
            src={incomestatementLogo}
            alt="Income statement Logo"
            className="desktop:h-7 desktop:w-7 laptop:h-7 laptop:w-7 phone:h-5 phone:w-5 mr-1"
          />
          <h1
            className={`desktop:text-sm laptop:text-xs phone:text-[8px] text-[#5D7285] hover:text-[#0C82B4] font-base font-poppins ${
              isOpen ? "" : "hidden"
            }`}
          >
            Income statement
          </h1>
        </div>
      </a>
      <a href="/announcement-admin">
        <div className="flex items-center border-b-2 rounded-md hover:bg-[#E9F5FE]">
          <img
            src={announcementLogo}
            alt="Income statement Logo"
            className="desktop:h-7 desktop:w-7 laptop:h-7 laptop:w-7 phone:h-5 phone:w-5 mr-1"
          />
          <h1
            className={`desktop:text-sm laptop:text-xs phone:text-[8px] text-[#5D7285] hover:text-[#0C82B4] font-base font-poppins ${
              isOpen ? "" : "hidden"
            }`}
          >
            Announcement
          </h1>
        </div>
      </a>
    </div>
  );
};

export default Sidebar;
