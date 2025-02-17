import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MenuOutlined,
  HomeFilled,
  DollarCircleFilled,
  LineChartOutlined,
  ContainerFilled,
  NotificationFilled,
  CalendarFilled,
  SettingFilled,
  ScheduleFilled,
} from "@ant-design/icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebases/FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import defaultProfilePic from "../../assets/images/default-profile-pic.png";

const MobileSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [managementOpen, setManagementOpen] = useState(false);
  const location = useLocation();
  const [displayName, setDisplayName] = useState("Guest");
  const [photoURL, setPhotoURL] = useState(defaultProfilePic);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayName(userData.fullName || "User");
            setPhotoURL(userData.profilePicture || defaultProfilePic);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setDisplayName("Guest");
        setPhotoURL(defaultProfilePic);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleManagement = () => {
    setManagementOpen(!managementOpen);
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
      case "/venue-management-admin":
        return "7";
      case "/user-management":
        return "8";
      default:
        return "1";
    }
  };

  return (
    <div className="relative">
      {/* Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-40 ${
          collapsed
            ? "opacity-0 pointer-events-none"
            : "opacity-70 pointer-events-auto"
        }`}
        onClick={toggleSidebar}
        style={{ top: "60px" }}
      ></div>

      {/* Toggle Button */}
      <div className="fixed top-2 right-2 bg-[#0C82B4] h-8 w-8 flex justify-center items-center z-50">
        <MenuOutlined
          className="text-white cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-12 right-0 bg-white shadow-lg rounded-b-xl transition-all duration-300 z-50 ${
          collapsed
            ? "w-full h-0 pointer-events-none"
            : "w-full h-auto pointer-events-auto"
        } sm:w-[320px] md:w-[360px] lg:w-[400px]`}
        style={{ overflow: "hidden" }}
      >
        <ul className="flex flex-col space-y-4 p-4">
          {/* Navigation Links */}
          <li
            className={`p-2 flex items-center justify-center hover:bg-gray-100 ${
              selectedKey() === "1" && "bg-slate-50"
            } transition-all duration-300`}
          >
            <Link
              to="/dashboard-admin"
              className="flex items-center w-full"
              onClick={toggleSidebar}
            >
              <HomeFilled className="mr-4 text-[#0C82B4]" />
              <span className="text-[#0C82B4]">Dashboard</span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center justify-center hover:bg-gray-100 ${
              selectedKey() === "2" && "bg-slate-50"
            } transition-all duration-300`}
          >
            <Link
              to="/balance-sheet-admin"
              className="flex items-center w-full"
              onClick={toggleSidebar}
            >
              <DollarCircleFilled className="mr-4 text-[#0C82B4]" />
              <span className="text-[#0C82B4]">Balance Sheet</span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center justify-center hover:bg-gray-100 ${
              selectedKey() === "5" && "bg-slate-50"
            } transition-all duration-300`}
          >
            <Link
              to="/announcement-admin"
              className="flex items-center w-full"
              onClick={toggleSidebar}
            >
              <NotificationFilled className="mr-4 text-[#0C82B4]" />
              <span className="text-[#0C82B4]">Announcement</span>
            </Link>
          </li>

          <li
            className={`p-2 flex items-center justify-center hover:bg-gray-100 ${
              selectedKey() === "6" && "bg-slate-50"
            } transition-all duration-300`}
          >
            <Link
              to="/events-admin"
              className="flex items-center w-full"
              onClick={toggleSidebar}
            >
              <CalendarFilled className="mr-4 text-[#0C82B4]" />
              <span className="text-[#0C82B4]">Venue Reservations</span>
            </Link>
          </li>

          {/* Management Submenu */}
          <li className="p-2 flex flex-col items-start hover:bg-gray-100 transition-all duration-300">
            <div
              className="flex items-center w-full cursor-pointer"
              onClick={toggleManagement}
            >
              <SettingFilled className="mr-4 text-[#0C82B4]" />
              <span className="text-[#0C82B4]">Management</span>
            </div>
            {managementOpen && (
              <ul className="ml-8 mt-2 space-y-2">
                <li
                  className={`p-2 flex items-center hover:bg-gray-100 ${
                    selectedKey() === "3" && "bg-slate-50"
                  } transition-all duration-300`}
                >
                  <Link
                    to="/cash-flow-admin"
                    className="flex items-center w-full"
                  >
                    <LineChartOutlined className="mr-4 text-[#0C82B4]" />
                    <span className="text-[#0C82B4]">Cash Flow</span>
                  </Link>
                </li>

                <li
                  className={`p-2 flex items-center hover:bg-gray-100 ${
                    selectedKey() === "4" && "bg-slate-50"
                  } transition-all duration-300`}
                >
                  <Link
                    to="/income-state-admin"
                    className="flex items-center w-full"
                  >
                    <ContainerFilled className="mr-4 text-[#0C82B4]" />
                    <span className="text-[#0C82B4]">Income</span>
                  </Link>
                </li>

                <li
                  className={`p-2 flex items-center hover:bg-gray-100 ${
                    selectedKey() === "7" && "bg-slate-50"
                  } transition-all duration-300`}
                >
                  <Link
                    to="/venue-management-admin"
                    className="flex items-center w-full"
                  >
                    <ScheduleFilled className="mr-4 text-[#0C82B4]" />
                    <span className="text-[#0C82B4]">Revenue and Expenses</span>
                  </Link>
                </li>

                <li
                  className={`p-2 flex items-center hover:bg-gray-100 ${
                    selectedKey() === "8" && "bg-slate-50"
                  } transition-all duration-300`}
                >
                  <Link
                    to="/user-management"
                    className="flex items-center w-full"
                  >
                    <SettingFilled className="mr-4 text-[#0C82B4]" />
                    <span className="text-[#0C82B4]">User Management</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          {/* Profile Section */}
          <li className="mt-auto p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              {/* Profile Image */}
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={photoURL}
                  alt="Profile"
                  className={`rounded-full ${loading ? "animate-pulse" : ""}`}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="font-semibold text-[#0C82B4]">
                  {displayName}
                </div>
                <Link to="/profile" className="text-sm text-[#0C82B4]">
                  View Profile
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MobileSidebar;
