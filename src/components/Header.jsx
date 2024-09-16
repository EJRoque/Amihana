import React, { useEffect, useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import defaultProfilePic from "../assets/images/default-profile-pic.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebases/FirebaseConfig";
import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons"; // Importing the hamburger icon

// Custom Hook to detect if the screen is mobile
function useMobileView() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

const Header = ({ user, onUserUpdate }) => {
  const [displayName, setDisplayName] = useState("Guest");
  const [photoURL, setPhotoURL] = useState(defaultProfilePic);
  const [loading, setLoading] = useState(true);
  const isMobile = useMobileView(); // Detect if the screen is mobile

  const navigate = useNavigate();

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

  useEffect(() => {
    if (user) {
      setDisplayName(user.fullName || "User");
      setPhotoURL(user.profilePicture || defaultProfilePic);
    }
  }, [user]);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      navigate("/"); // Redirect to the login page after logout
    });
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <a onClick={handleLogout}>Logout</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="bg-[#0C82B4] sticky top-0 z-50 desktop:h-16 laptop:h-16 phone:h-12 desktop:px-4 desktop:py-2 flex items-center justify-between shadow-2xl">
      
      {/* Mobile View */}
      {isMobile ? (
        <div className="flex justify-between items-center w-full px-4">
          {/* Logo */}
          <img
            src={amihanaLogo}
            alt="Amihana Logo"
            className="h-8"
            style={{ filter: "invert(1) brightness(0.1)" }}
          />

          {/* Hamburger Icon for Mobile */}

        </div>
      ) : (

        
        // Desktop/Laptop View
        <>
          <img
            src={amihanaLogo}
            alt="Amihana Logo"
            className="ml-3 desktop:h-12 laptop:h-10 phone:h-8"
            style={{ filter: "invert(1) brightness(0.1)" }}
          />
          <div className="relative space-x-2">
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              overlayStyle={{ minWidth: 160 }}
            >
              <button className="flex items-center mr-6 space-x-2">
                <img
                  src={photoURL}
                  alt="Profile Picture"
                  className={`desktop:h-12 desktop:w-12 laptop:h-10 laptop:w-10 phone:h-8 phone:w-8 rounded-full ${
                    loading ? "animate-pulse" : ""
                  }`}
                  style={{ objectFit: "cover" }}
                />
                <p className="text-center my-auto ml-2 font-poppins desktop:text-base laptop:text-base phone:text-xs text-white">
                  {loading ? "Loading..." : displayName}
                </p>
                <DownOutlined className="desktop:h-5 desktop:w-5 laptop:h-5 laptop:w-5 tablet:h-4 tablet:w-4 phone:h-3 phone:w-3 ml-1 text-white" />
              </button>
            </Dropdown>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
