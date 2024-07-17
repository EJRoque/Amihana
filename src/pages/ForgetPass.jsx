// src/pages/ForgetPassword.jsx
import React, { useState } from 'react';
import amihanaLogo from "../assets/images/amihana-logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebases/FirebaseConfig"; // Correct import path
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your email.");
      navigate("/forget-password"); // Redirect back to the forget password page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="amihana-bg flex justify-center">
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-3">
            <img src={amihanaLogo} alt="Amihana logo" />
            <div>
              <h2 className="desktop:text-4xl laptop:text-3xl phone:text-2xl font-semibold desktop:mb-5 laptop:mb-5 phone:mb-3">
                Forget Password
              </h2>
              <form onSubmit={handleSubmit}>
                <label htmlFor="email" className="desktop:text-2xl laptop:text-xl phone:text-lg mb-1">
                  Email
                </label>
                <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow px-4 pr-10 h-[2rem] outline-none"
                    placeholder='Input Email Address'
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                  Send Reset Email
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;