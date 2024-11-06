import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SidebarHomeOwners from "../components/home-owners/Sidebar";
import SidebarAdmin from "../components/admin/Sidebar";
import MobileSidebarHOA from "../components/home-owners/MobileSidebarHOA";
import MobileSidebar from "../components/admin/MobileSidebar";
import ProfilePreview from "../components/ProfilePreview";
import MobileProfprev from "./MobileProfprev"; // Import MobileProfprev
import { db } from "../firebases/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NavigationTabsProfile from "../components/Modals/NavigationTabsProfile";

// Hook to detect mobile and tablet views
function useMobileView() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobileOrTablet;
}

function ProfilePage() {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    age: "",
    isAdmin: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobileOrTablet = useMobileView();

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setHomeOwner(userData);
            localStorage.setItem("homeOwner", JSON.stringify(userData));
          } else {
            console.error("User document not found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomeOwner((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          fullName: homeOwner.fullName,
          email: homeOwner.email,
          phoneNumber: homeOwner.phoneNumber,
          age: homeOwner.age,
        });
        localStorage.setItem("homeOwner", JSON.stringify(homeOwner));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("User not authenticated!");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle sidebar for mobile view
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header user={homeOwner} onSidebarToggle={toggleMobileSidebar} />

      <div className="flex flex-grow">
        {isMobileOrTablet ? (
          homeOwner.isAdmin ? (
            <MobileSidebar isOpen={isMobileSidebarOpen} onClose={toggleMobileSidebar} />
          ) : (
            <MobileSidebarHOA isOpen={isMobileSidebarOpen} onClose={toggleMobileSidebar} />
          )
        ) : (
          homeOwner.isAdmin ? <SidebarAdmin /> : <SidebarHomeOwners />
        )}

        <div className="flex flex-col flex-grow items-center p-4">
          {/* Only show ProfilePreview or MobileProfprev when the sidebar is closed */}
          {!isMobileSidebarOpen && (
            isMobileOrTablet ? (
              <MobileProfprev homeOwner={homeOwner} />
            ) : (
              <>
                <NavigationTabsProfile homeOwner={homeOwner} />
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
