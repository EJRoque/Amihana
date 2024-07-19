import React, { useState } from "react";
import Header from "../../components/Header";
import SidebarAdmin from "../../components/home-owners/Sidebar";
import ProfilePreview from "../../components/ProfilePreview";

function HomeOwnerProfilePage() {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "John Doe",
    email: "johndoe@example.com",
    phoneNumber: "123-456-7890",
    profilePicture: null, // or a valid image URL
    age: 35,
  });

  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = () => {
    setIsEditing(false);
    // Here, you can also add logic to save the changes to a database or API
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-grow">
        <SidebarAdmin />
        <main className="flex-grow flex justify-center items-center p-6">
          <div className="w-full max-w-8xl h-full max-h--8xl bg-white rounded-lg shadow-md p-4">
            <h2 className="text-2xl font-semibold mb-4">View Profile</h2>
            <div className="flex space-x-10">
              <div className="w-1/6 p-4">
                <ProfilePreview homeOwner={homeOwner} />
              </div>
              <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    {isEditing ? "Edit Profile" : "Profile Details"}
                  </h3>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={isEditing ? handleSave : handleEditToggle}
                  >
                    {isEditing ? "Save" : "Edit"}
                  </button>
                </div>
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
                      />
                    ) : (
                      <p className="text-lg font-medium">{homeOwner.fullName}</p>
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
                      />
                    ) : (
                      <p className="text-lg font-medium">{homeOwner.email}</p>
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
                      />
                    ) : (
                      <p className="text-lg font-medium">{homeOwner.phoneNumber}</p>
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
                      />
                    ) : (
                      <p className="text-lg font-medium">{homeOwner.age}</p>
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

export default HomeOwnerProfilePage;
