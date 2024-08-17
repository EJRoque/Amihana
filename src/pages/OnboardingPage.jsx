import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import amihanaLogo from "../assets/images/amihana-logo.png";
import defaultProfilePic from "../assets/images/default-profile-pic.png";

const OnboardingPage = ({
  account,
  setAccount,
  imagePreview,
  setImagePreview,
}) => {
  const navigate = useNavigate();

  // Handle change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      const file = files[0];
      setAccount((prevAccount) => ({
        ...prevAccount,
        profilePicture: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setAccount((prevAccount) => ({
        ...prevAccount,
        [name]: value,
      }));
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Redirect to another page
    navigate("/review-onboarding");
  };

  return (
    // bg image
    <div className="amihana-bg flex justify-center">
      {/* onboarding section */}
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex justify-center items-center flex-col">
          {/* amihana logo */}
          <div className="flex desktop:w-[18rem] laptop:w-[14rem] phone:w-[12rem] mb-1">
            <img src={amihanaLogo} alt="Amihina logo" />
          </div>
          {/* Onboarding form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h1 className="text-center desktop:text-2xl laptop:text-xl phone:text-xl font-semibold mb-2">
              Create Account
            </h1>

            <label
              htmlFor="profilePicture"
              className="text-center desktop:text-xl laptop:text-lg phone:text-lg mb-2"
            >
              Profile picture
            </label>
            <div className="h-[6rem] desktop:w-[21rem] laptop:w-[16rem] phone:w-[16rem] flex flex-col items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="desktop:w-16 desktop:h-16 laptop:w-14 laptop:h-14 phone:w-12 phone:h-12 object-cover rounded-full mb-1"
                />
              ) : (
                <img
                  src={defaultProfilePic}
                  alt="Default Profile Preview"
                  className="desktop:w-16 desktop:h-16 laptop:w-14 laptop:h-14 phone:w-12 phone:h-12 object-cover rounded-full mb-1"
                />
              )}

              <input
                required
                type="file"
                id="profilePicture"
                AAAAAAAAA
                name="profilePicture"
                accept=".jpg, .jpeg, .png"
                onChange={handleChange}
                className="ml-20 phone:w-[16rem] phone:ml-10 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-sm file:bg-gray-200 file:text-gray-700 file:rounded-md"
              />
            </div>

            <label
              htmlFor="fullName"
              className="desktop:text-xl laptop:text-xl phone:text-lg mb-1"
            >
              Full name
            </label>
            <div className="h-[2.5rem] desktop:w-[21rem] phone:w-[16rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
              <input
                required
                type="text"
                id="fullName"
                name="fullName"
                value={account.fullName}
                onChange={handleChange}
                placeholder="ex. Juan Dela Cruz"
                className="flex-grow px-4 pr-10 h-[1rem] outline-none"
              />
            </div>

            <label
              htmlFor="phoneNumber"
              className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1"
            >
              Phone number
            </label>
            <div className="h-[2.5rem] desktop:w-[21rem] phone:w-[16rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
              <input
                required
                minLength="11"
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={account.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="flex-grow px-4 pr-10 h-[2rem] outline-none"
              />
            </div>

            <label
              htmlFor="age"
              className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1"
            >
              Age
            </label>
            <div className="h-[2.5rem] desktop:w-[21rem] phone:w-[16rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
              <input
                required
                type="text"
                id="age"
                name="age"
                value={account.age}
                onChange={handleChange}
                placeholder="Enter age"
                className="flex-grow px-4 pr-10 h-[2rem] outline-none"
              />
            </div>

            <button
              type="submit"
              className="h-[2.5rem] desktop:w-[21rem] phone:w-[16rem] bg-[#0C82B4] rounded-md text-white desktop:mt-14 mt-10"
            >
              Next
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
