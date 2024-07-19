import React from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import defaultProfilePic from "../assets/images/default-profile-pic.png";
import arrowDown from "../assets/icons/arrow-down.svg";

const Header = () => {
  return (
    <div className="bg-[#0C82B4] sticky top-0 desktop:h-16 laptop:h-16 phone:h-12 desktop:px-4 desktop:py-2 flex items-center justify-between shadow-2xl">
      <img
        src={amihanaLogo}
        alt="Amihana Logo"
        className="ml-3 desktop:h-12 laptop:h-10 phone:h-8"
        style={{ filter: "invert(1) brightness(0.1)" }}
      />
      <button className="flex items-center mr-3">
        <a href="/home-owner-profile">
        <img
          src={defaultProfilePic}
          alt="Default Profile Picture"
          className="desktop:h-12 laptop:h-10 phone:h-8"
        />
        </a>
        <p className="text-center ml-2 font-poppins desktop:text-base laptop:text-base phone:text-xs">
          User, Default
        </p>
        <img
          src={arrowDown}
          alt="Arrow down Logo"
          className="desktop:h-5 desktop:w-5 laptop:h-5 laptop:w-5 phone:h-4 phone:w-4 ml-2"
        />

      </button>
    </div>
  );
};

export default Header;
