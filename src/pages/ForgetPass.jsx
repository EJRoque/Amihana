// src/ForgetPassword.js
import React, { useState } from 'react';
import amihanaLogo from "../assets/images/amihana-logo.png";

const ForgetPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Password reset link sent to: ${email}`);
  };

  return (
<div className="amihana-bg flex justify-center">
    {/* signup section */}
    <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
      <div className="flex flex-col">
        {/* amihana logo */}
        <div className="desktop:w-[21rem] phone:w-[16rem] mb-3">
          <img src={amihanaLogo} alt="Amihina logo" />
 <div>
      <h2 className="desktop:text-4xl laptop:text-3xl phone:text-2xl font-semibold desktop:mb-5 laptop:mb-5 phone:mb-3">
              Forget Password</h2>
      <form onSubmit={handleSubmit}>
        
          <label htmlFor="email"
              className="desktop:text-2xl laptop:text-xl phone:text-lg mb-1">
              Email</label>
        <div className="desktop:w-[21rem] desktop:h-[3rem] phone:w-[16rem] phone:h-[2.7rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center ${formErrors.email && 'mb-2'}">
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
        <p className="text-center mt-4 desktop:text-sm desktop:pr-1 laptop:mb-16 phone:text-xs phone:pr-1 phone:mb-10">
              <a href="/forget-password" className="text-[#0C82B4]">
                Send Reset Email
              </a>
            </p>
      </form>
    </div>
</div>
</div>
</div>
</div>

   
  );
};

export default ForgetPassword;
