import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SidebarHomeOwners from "../components/home-owners/Sidebar";
import SidebarAdmin from "../components/admin/Sidebar";
import ProfilePreview from "../components/ProfilePreview";
import { db } from "../firebases/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function ProfilePage() {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: null,
    age: "",
    isAdmin: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatedUser, setUpdatedUser] = useState(homeOwner);

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setHomeOwner(userData);
            localStorage.setItem("homeOwner", JSON.stringify(userData)); // Save to localStorage
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
        localStorage.setItem("homeOwner", JSON.stringify(homeOwner)); // Update localStorage
        setIsEditing(false);
        setUpdatedUser(homeOwner);
        alert("Profile updated successfully!");
      } else {
        alert("User not authenticated!");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header user={updatedUser} />
      <div className="flex flex-grow">
        {homeOwner.isAdmin ? <SidebarAdmin /> : <SidebarHomeOwners />}
        <main className="flex-grow flex justify-center items-center p-6">
          <div className="w-full max-w-7xl h-full bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                {isEditing ? "Edit Profile" : "View Profile"}
              </h2>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={isEditing ? handleSave : handleEditToggle}
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
            <div className="flex space-x-10">
              <div className="w-1/4 p-4 bg-gray-50 rounded-lg shadow-md">
                <ProfilePreview homeOwner={homeOwner} />
              </div>
              <div className="w-3/4 bg-white p-4 rounded-lg shadow-md">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={homeOwner.fullName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        style={{ maxWidth: "100%" }}
                      />
                    ) : (
                      <p className="text-lg font-medium break-words">
                        {homeOwner.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-600">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={homeOwner.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        style={{ maxWidth: "100%" }}
                      />
                    ) : (
                      <p className="text-lg font-medium break-words">
                        {homeOwner.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-600">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={homeOwner.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        style={{ maxWidth: "100%" }}
                      />
                    ) : (
                      <p className="text-lg font-medium break-words">
                        {homeOwner.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-600">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={homeOwner.age}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        style={{ maxWidth: "100%" }}
                      />
                    ) : (
                      <p className="text-lg font-medium break-words">
                        {homeOwner.age}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
