import React, { useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { auth, db } from "../firebases/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

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
      toast.success("Login successful");
      console.log("Login successful");

      const user = userCredential.user;
      if (user) {
        localStorage.setItem("userId", user.uid);

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.isAdmin) {
            navigate("/cash-flow-admin");
          } else {
            navigate("/cash-flow-home-owners");
          }
        } else {
          setError("User data not found.");
          toast.error("User data not found.");
        }
      } else {
        setError("User not authenticated.");
        toast.error("User not authenticated.");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setError("Invalid email or password. Please try again.");
      toast.error("Invalid email or password. Please try again.");
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
            <h1 className="desktop:text-4xl laptop:text-3xl phone:text-2xl font-semibold desktop:mb-5 laptop:mb-5 phone:mb-3">
              Log in
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
              className="desktop:text-2xl laptop:text-xl phone:text-lg mt-6 mb-1"
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

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <p className="text-end mt-4 desktop:text-sm desktop:pr-1 laptop:mb-16 phone:text-xs phone:pr-1 phone:mb-10">
              Forgot password?{" "}
              <a href="/forget-password" className="text-[#0C82B4]">
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
              <a href="/signup" className="text-[#0C82B4]">
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
