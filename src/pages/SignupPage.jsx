import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { HiEye, HiEyeOff } from "react-icons/hi";

const SignupPage = ({ account, setAccount }) => {
  const navigate = useNavigate();

  //Show passwordd--
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  //--

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Confirm password validation
    if (account.password !== account.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Email:", account.email);
    console.log("Password:", account.password);
    console.log("Confirm Password:", account.confirmPassword);

    // Clear form after submission
    setAccount({
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Redirect to another page
    navigate("/onboarding");
  };
  //--
  return (
    //bg image
    <div className="amihana-bg flex justify-center">
      {/* signup section */}
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          {/* amihana logo */}
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-3">
            <img src={amihanaLogo} alt="Amihina logo" />
          </div>
          {/* Signup form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h1 className="desktop:text-4xl laptop:text-3xl phone:text-2xl font-semibold desktop:mb-5 laptop:mb-3 phone:mb-3">
              Sign up
            </h1>
            <label
              htmlFor="email"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mb-1"
            >
              Email
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
              <input
                required
                type="email"
                id="email"
                name="email"
                value={account.email}
                onChange={handleChange}
                placeholder="sample@email.com"
                className="flex-grow px-4 pr-10 h-[2rem] outline-none"
              />
            </div>

            <label
              htmlFor="password"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-5 mb-1"
            >
              Password
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center relative">
              <input
                required
                minLength="8"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={account.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="flex-grow px-4 pr-10 h-[2rem] outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>

            <label
              htmlFor="confirmPassword"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-5 mb-1"
            >
              Confirm Password
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center relative">
              <input
                required
                minLength="8"
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={account.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="flex-grow px-4 pr-10 h-[2rem] outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>

            <button
              type="submit"
              className="desktop:h-[3rem] desktop:w-[21rem] phone:h-[2.7rem] phone:w-[16rem] bg-[#0C82B4] rounded-md text-white mt-16"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
