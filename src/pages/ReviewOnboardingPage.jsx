import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import amihanaLogo from "../assets/images/amihana-logo.png";

const ReviewOnboardingPage = ({ account, imagePreview }) => {
  const navigate = useNavigate();

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Profile picture:", account.profilePicture);
    console.log("Full name:", account.fullName);
    console.log("Phone number:", account.phoneNumber);
    console.log("Age:", account.age);

    // Redirect to another page
    //navigate("/onboarding");
  };

  return (
    // bg image
    <div className="amihana-bg flex justify-center">
      {/* onboarding section */}
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          {/* amihana logo */}
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-1">
            <img src={amihanaLogo} alt="Amihina logo" />
          </div>
          {/* Onboarding form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h1 className="text-center desktop:text-2xl laptop:text-xl phone:text-xl font-semibold desktop:mb-5 laptop:mb-3 phone:mb-3">
              Lets review your details
            </h1>

            <label
              htmlFor="profilePicture"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mb-1"
            >
              Profile picture
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="desktop:w-10 desktop:h-10 phone:w-8 phone:h-8 object-cover rounded-full ml-4 mr-1"
              />
            </div>

            <label
              htmlFor="fullName"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-3 mb-1"
            >
              Full name
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
              <p className="ml-4">{account.fullName}</p>
            </div>

            <label
              htmlFor="phoneNumber"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-3 mb-1"
            >
              Phone number
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center relative">
              <p className="ml-4">{account.phoneNumber}</p>
            </div>

            <label
              htmlFor="age"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-3 mb-1"
            >
              Age
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center relative">
              <p className="ml-4">{account.age}</p>
            </div>

            <div className="flex desktop:space-x-28 desktop:mt-16 mt-10 phone:space-x-24">
              <button
                type="button"
                //this will go back to the previous page
                onClick={() => navigate(-1)}
                className="desktop:h-[3rem] desktop:w-[7rem] phone:h-[2.5rem] phone:w-[5rem] bg-white rounded-md text-[#0C82B4] border-2 border-solid border-gray-400"
              >
                Back
              </button>

              <button
                type="submit"
                className="desktop:h-[3rem] desktop:w-[7rem] phone:h-[2.5rem] phone:w-[5rem] bg-[#0C82B4] rounded-md text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewOnboardingPage;
