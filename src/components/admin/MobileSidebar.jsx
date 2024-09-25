import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MenuOutlined,
  HomeFilled,
  DollarCircleFilled,
  LineChartOutlined,
  ContainerFilled,
  NotificationFilled,
  CalendarFilled,
} from "@ant-design/icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebases/FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import defaultProfilePic from "../../assets/images/default-profile-pic.png";
import { Dropdown, Menu } from "antd";

export default function MobileSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      navigate("/");
    });
  };

  const menu = (
    <Menu className="!w-[250px] sm:!w-[300px] md:!w-[350px] lg:!w-[400px]">
      <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <a onClick={handleLogout}>Logout</a>
      </Menu.Item>
    </Menu>
  );

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLinkClick = () => {
    setCollapsed(true);
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
          className="text-white transition-transform duration-300"
          onClick={toggleSidebar}
        />
      </div>
      <div
        className={`fixed top-12 right-0 bg-white shadow-lg rounded-b-xl transition-all ease-in-out duration-300 
          ${collapsed ? "w-full h-0 pointer-events-none" : "w-full h-[80vh] pointer-events-auto"}
          sm:w-[320px] md:w-[360px] lg:w-[400px]`}
        style={{ overflow: "hidden" }}
      >
        <ul className="flex flex-col space-y-4 p-4">
          {/* Navigation Links */}
          <li className={`p-2 flex items-center hover:bg-gray-100 ${selectedKey() === "1" && "bg-slate-50"} transition-all duration-300 transform hover:scale-105 active:scale-95`}>
            <Link to="/dashboard-admin" className="flex items-center w-full" onClick={handleLinkClick}>
              <HomeFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span className={`transition-all duration-500 ${collapsed ? "opacity-0 translate-y-[-50px] hidden" : "opacity-100 translate-y-0 block"}`}>Dashboard</span>
            </Link>
          </li>
          <li className={`p-2 flex items-center hover:bg-gray-100 ${selectedKey() === "2" && "bg-slate-50"} transition-all duration-300 transform hover:scale-105 active:scale-95`}>
            <Link to="/balance-sheet-admin" className="flex items-center w-full" onClick={handleLinkClick}>
              <DollarCircleFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span className={`transition-all duration-500 ${collapsed ? "opacity-0 translate-y-[-50px] hidden" : "opacity-100 translate-y-0 block"}`}>Balance Sheet</span>
            </Link>
          </li>
          <li className={`p-2 flex items-center hover:bg-gray-100 ${selectedKey() === "3" && "bg-slate-50"} transition-all duration-300 transform hover:scale-105 active:scale-95`}>
            <Link to="/cash-flow-admin" className="flex items-center w-full" onClick={handleLinkClick}>
              <LineChartOutlined className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span className={`transition-all duration-500 ${collapsed ? "opacity-0 translate-y-[-50px] hidden" : "opacity-100 translate-y-0 block"}`}>Cash Flow Record</span>
            </Link>
          </li>
          <li className={`p-2 flex items-center hover:bg-gray-100 ${selectedKey() === "4" && "bg-slate-50"} transition-all duration-300 transform hover:scale-105 active:scale-95`}>
            <Link to="/income-state-admin" className="flex items-center w-full" onClick={handleLinkClick}>
              <ContainerFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span className={`transition-all duration-500 ${collapsed ? "opacity-0 translate-y-[-50px] hidden" : "opacity-100 translate-y-0 block"}`}>Income Statement</span>
            </Link>
          </li>
          <li className={`p-2 flex items-center hover:bg-gray-100 ${selectedKey() === "5" && "bg-slate-50"} transition-all duration-300 transform hover:scale-105 active:scale-95`}>
            <Link to="/announcement-admin" className="flex items-center w-full" onClick={handleLinkClick}>
              <NotificationFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span className={`transition-all duration-500 ${collapsed ? "opacity-0 translate-y-[-50px] hidden" : "opacity-100 translate-y-0 block"}`}>Announcement</span>
            </Link>
          </li>
          <li className={`p-2 flex items-center hover:bg-gray-100 ${selectedKey() === "6" && "bg-slate-50"} transition-all duration-300 transform hover:scale-105 active:scale-95`}>
            <Link to="/events-admin" className="flex items-center w-full" onClick={handleLinkClick}>
              <CalendarFilled className="mr-4 h-7 w-7 transition-transform duration-300 text-[#0C82B4]" />
              <span className={`transition-all duration-500 ${collapsed ? "opacity-0 translate-y-[-50px] hidden" : "opacity-100 translate-y-0 block"}`}>Events</span>
            </Link>
          </li>

          {/* Profile Section */}
          <div className="bg-slate-100 w-full rounded-lg shadow-lg flex items-center p-4 space-x-4 mt-4">
            {/* Profile Picture */}
            <div className="rounded-full w-20 h-20">
              <img
                src={photoURL}
                alt="Profile Picture"
                className={`h-full w-full rounded-full ${loading ? "animate-pulse" : ""}`}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className={`text-lg font-semibold ${loading ? "animate-pulse" : ""}`}>{displayName}</div>
              <Dropdown overlay={menu} trigger={['click']} className="relative">
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                  Actions
                </a>
              </Dropdown>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
}
