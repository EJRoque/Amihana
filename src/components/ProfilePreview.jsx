import React from "react";

const ProfilePreview = ({ homeOwner }) => {
  return (
    <div className="profile-preview font-poppins bg-white p-4 rounded-lg shadow-md phone:w-50 laptop:w-60 desktop:w-60 mx-auto">
      <div className="profile-picture flex justify-center mb-4">
        {homeOwner.profilePicture ? (
          <img
            src={homeOwner.profilePicture}
            alt="Profile"
            className="phone:w-24 phone:h-24 laptop:w-32 laptop:h-32 desktop:w-50 desktop:h-40 rounded-full object-cover"
          />
        ) : (
          <div className="phone:w-24 phone:h-24 laptop:w-32 laptop:h-32 desktop:w-40 desktop:h-40 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <div className="profile-details text-justify">
      </div>
    </div>
  );
};

export default ProfilePreview;
