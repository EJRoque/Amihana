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
import { Dropdown, Menu, Modal } from "antd";

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
    // Show confirmation modal before logging out
    Modal.confirm({
        centered: true,
        title: 'Are you sure you want to log out?',
        content: 'You will need to log in again to access your account.',
        okText: 'Log Out',
        cancelText: 'Cancel',
        onOk: () => {
            const auth = getAuth();
            auth.signOut().then(() => {
                navigate("/");  // Navigate to the home or login page after logging out
                console.log('User logged out');
            }).catch((error) => {
                console.error('Error logging out:', error);
            });
        },
        onCancel: () => {
            console.log('Logout cancelled');
        }
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
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-40 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-70 pointer-events-auto"}`}
        onClick={toggleSidebar}
        style={{ top: '60px' }} // Positioning the dark overlay below the header (adjust this value if necessary)
      ></div>
      <div className="fixed top-2 right-2 bg-[#0C82B4] h-8 w-8 flex justify-center z-50">
        <MenuOutlined
          className="text-white transition-transform duration-[1000ms]"
          onClick={toggleSidebar}
        />
      </div>
      <div
       className={`fixed top-12 right-0 bg-white shadow-lg rounded-b-xl transition-all ease-in-out duration-300 z-50 
        ${collapsed ? 
          "w-full h-0  pointer-events-none" :                       
          "w-full h-[60vh] pointer-events-auto"}
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
                Venues
              </span>
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
              <Dropdown overlay={menu} trigger={['click']} overlayStyle={{ minWidth: 160 }}>
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
