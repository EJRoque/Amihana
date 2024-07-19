import React from "react";

const ProfilePreview = ({ homeOwner }) => {
  return (
    <div className="profile-preview bg-white p-4 rounded-lg shadow-md">
      <div className="profile-picture flex justify-center mb-4">
        {homeOwner.profilePicture ? (
          <img
            src={homeOwner.profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <div className="profile-details text-center">
        <h2 className="text-xl font-semibold mb-2">{homeOwner.fullName}</h2>
        <p className="text-gray-600 mb-1">{homeOwner.email}</p>
        <p className="text-gray-600 mb-1">{homeOwner.phoneNumber}</p>
        <p className="text-gray-600 mb-1">Age: {homeOwner.age}</p>
      </div>
    </div>
  );
};

export default ProfilePreview;
