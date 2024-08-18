import React, { useEffect, useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import defaultProfilePic from "../assets/images/default-profile-pic.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebases/FirebaseConfig";
import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";

const Header = ({ user, onUserUpdate }) => {
  const [displayName, setDisplayName] = useState("Guest");
  const [photoURL, setPhotoURL] = useState(defaultProfilePic);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Start loading
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
      setLoading(false); // Stop loading
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
      window.location.href = "/"; // Redirect to login page after logout
    });
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <a href="/profile">Profile</a>
      </Menu.Item>
      <Menu.Item key="logout">
        <a onClick={handleLogout}>Logout</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="bg-[#0C82B4] sticky top-0 desktop:h-16 laptop:h-16 phone:h-12 desktop:px-4 desktop:py-2 flex items-center justify-between shadow-2xl">
      <img
        src={amihanaLogo}
        alt="Amihana Logo"
        className="ml-3 desktop:h-12 laptop:h-10 phone:h-8"
        style={{ filter: "invert(1) brightness(0.1)" }}
      />
      <div className="relative">
        <Dropdown
          overlay={menu}
          trigger={['click']}
          overlayStyle={{ minWidth: 160 }}
        >
          <button className="flex items-center mr-3">
            <img
              src={photoURL}
              alt="Profile Picture"
              className={`desktop:h-12 desktop:w-12 laptop:h-10 laptop:w-10 phone:h-8 phone:w-8 rounded-full ${
                loading ? "animate-pulse" : ""
              }`}
              style={{ objectFit: "cover" }}
            />
            <p className="text-center ml-2 font-poppins desktop:text-base laptop:text-base phone:text-xs text-white">
              {loading ? "Loading..." : displayName}
            </p>
            <DownOutlined
              className="desktop:h-5 desktop:w-5 laptop:h-5 laptop:w-5 tablet:h-4 tablet:w-4 phone:h-3 phone:w-3 ml-1 text-white"
            />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
