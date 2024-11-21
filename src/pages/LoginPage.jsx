import React, { useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { auth, db } from "../firebases/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { Input, Button } from "antd";
import { message } from "antd";

const LoginPage = () => {

  const [account, setAccount] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        account.email,
        account.password
      );
      message.success("Login successful");
      console.log("Login successful");

      const user = userCredential.user;
      if (user) {
        localStorage.setItem("userId", user.uid);

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if profile is complete
          if (!userData.profileCompleted) {
            // Redirect to profile completion page if not completed
            navigate("/profile-completion");
          } else {
            // Check for admin status and navigate to respective dashboard
            if (userData.isAdmin) {
              navigate("/dashboard-admin");
            } else {
              navigate("/dashboard-home-owners");
            }
          }
        } else {
          // If user data is not found, redirect to profile completion page
          navigate("/profile-completion");
        }
      } else {
        setError("User not authenticated.");
        message.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      message.error("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="amihana-bg flex justify-end">
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-5">
            <img src={amihanaLogo} alt="Amihana logo" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h1 className="text-start font-[Poppins] desktop:text-4xl laptop:text-3xl phone:text-2xl font-normal desktop:mb-5 laptop:mb-3 phone:mb-3">
              Log in
            </h1>
            <label
              htmlFor="email"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mb-1"
            >
              Email
            </label>
            <Input
              required
              type="email"
              id="email"
              name="email"
              value={account.email}
              onChange={handleChange}
              placeholder="sample@email.com"
              className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] border-gray-400"
            />
            
            <label
              htmlFor="password"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-6 mb-1"
            >
              Password
            </label>
            <Input.Password
              required
              minLength="8"
              id="password"
              name="password"
              value={account.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] border-gray-400"
              iconRender={visible => (visible ? <HiEye /> : <HiEyeOff />)} // Toggle visibility icon
              visibilityToggle
            />
            
            {error && <p className="text-red-500 mt-2">{error}</p>}

            <p className="text-end mt-4 desktop:text-sm desktop:pr-1 laptop:mb-16 phone:text-xs phone:pr-1 phone:mb-10">
              Forgot password?{" "}
              <Link to="/forget-password" className="text-[#0C82B4]">
                Click here
              </Link>
            </p>
            
            <Button
              type="primary"
              htmlType="submit"
              className="desktop:h-[3rem] desktop:w-[21rem] phone:h-[2.7rem] phone:w-[16rem] bg-[#0C82B4] rounded-md text-white mb-5"
            >
              Log in
            </Button>

            <p className="text-center desktop:text-sm phone:text-xs">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-[#0C82B4]">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
