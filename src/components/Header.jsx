import React, { useEffect, useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import defaultProfilePic from "../assets/images/default-profile-pic.png";
import arrowDown from "../assets/icons/arrow-down.svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebases/FirebaseConfig";

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

  return (
    <div className="bg-[#0C82B4] sticky top-0 desktop:h-16 laptop:h-16 phone:h-12 desktop:px-4 desktop:py-2 flex items-center justify-between shadow-2xl">
      <img
        src={amihanaLogo}
        alt="Amihana Logo"
        className="ml-3 desktop:h-12 laptop:h-10 phone:h-8"
        style={{ filter: "invert(1) brightness(0.1)" }}
      />
      <button className="flex items-center mr-3">
        <a href="/profile">
          <img
            src={photoURL}
            alt="Profile Picture"
            className={`desktop:h-12 laptop:h-10 phone:h-8 rounded-full ${loading ? 'animate-pulse' : ''}`}
          />
        </a>
        <p className="text-center ml-2 font-poppins desktop:text-base laptop:text-base phone:text-xs text-white">
          {loading ? 'Loading...' : displayName}
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
