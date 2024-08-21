import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SidebarHomeOwners from "../components/home-owners/Sidebar";
import SidebarAdmin from "../components/admin/Sidebar";
import ProfilePreview from "../components/ProfilePreview";
import { db } from "../firebases/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NavigationTabsProfile from "../components/Modals/NavigationTabsProfile";

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
          setLoading(false); // Ensure loading state is set to false after data fetch
        }
      } else {
        setLoading(false); // Set loading to false if user is not authenticated
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomeOwner({
      ...homeOwner,
      [name]: value,
    });
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

  const handleButtonClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      handleEditToggle();
    }
  };

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>; // Optional loading message
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header user={homeOwner} />

      <div className="flex flex-grow">
        {homeOwner.isAdmin ? <SidebarAdmin /> : <SidebarHomeOwners />}

        <div className="flex flex-col flex-grow items-center p-4">
          <div className="w-full max-w-3xl mb-6">
            <NavigationTabsProfile homeOwner={homeOwner} />
          </div>

          {/* Main profile section */}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
