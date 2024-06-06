import React, { useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { HiEye, HiEyeOff } from "react-icons/hi";

const LoginPage = () => {
  //Show passwordd--
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  //--

  //Log in from--
  const [account, setAccount] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChage = (e) => {
    const { name, value } = e.target;
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    //Form validation rules
    if (!account.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(account.email)) {
      errors.email = "Invalid email address";
    }

    if (!account.password) {
      errors.password = "Password is required";
    } else if (account.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      // Submit the form data
      console.log("Email:", account.email);
      console.log("Password:", account.password);
    }
  };
  //--

  return (
    //bg image
    <div className="amihana-bg flex justify-end">
      {/* login section */}
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          {/* amina logo */}
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-5">
            <img src={amihanaLogo} alt="Amihina logo" />
          </div>
          {/* Login form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h1 className="desktop:text-4xl laptop:text-3xl phone:text-2xl font-semibold desktop:mb-5 laptop:mb-5 phone:mb-3">
              Log in
            </h1>
            <label
              htmlFor="email"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mb-1"
            >
              Email
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center ${formErrors.email && 'mb-2'}">
              <input
                type="email"
                id="email"
                name="email"
                value={account.email}
                onChange={handleChage}
                placeholder="sample@email.com"
                className="flex-grow px-4 pr-10 h-[2rem] outline-none"
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-red-500 mb-2">{formErrors.email}</p>
            )}

            <label
              htmlFor="password"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-6 mb-1"
            >
              Password
            </label>
            <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center relative ${formErrors.password && 'mb-2'}">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={account.password}
                onChange={handleChage}
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
            {formErrors.password && (
              <p className="text-xs text-red-500 mb-2">{formErrors.password}</p>
            )}

            <p className="text-end mt-4 desktop:text-sm desktop:pr-1 laptop:mb-16 phone:text-xs phone:pr-1 phone:mb-10">
              Forgot password?{" "}
              <a href="" className="text-[#0C82B4]">
                Click here
              </a>
            </p>
            <button
              type="submit"
              className="desktop:h-[3rem] desktop:w-[21rem] phone:h-[2.7rem] phone:w-[16rem] bg-[#0C82B4] rounded-md text-white mb-5"
            >
              Log in
            </button>
            <p className="text-center desktop:text-sm phone:text-xs">
              Don't have an account yet?{" "}
              <a href="" className="text-[#0C82B4]">
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
