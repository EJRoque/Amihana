import React from "react";
import { Button, message } from "antd";
import { sendEmailVerification } from "firebase/auth";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { auth } from "../firebases/FirebaseConfig";

const EmailConfirmationPage = () => {
  // Resend confirmation email function
  const handleResendConfirmation = async () => {
    const user = auth.currentUser;
  
    // Log the user information for debugging
    if (!user) {
      message.error("You must be logged in to resend the confirmation email.");
      console.error("User is not logged in or not available.");
      return;
    } else {
      console.log("Current user:", user);
    }
  
    // Check if the email is already verified
    if (user.emailVerified) {
      message.info("Your email is already verified.");
      console.log("Email is already verified, no need to resend.");
      return;
    }
  
    try {
      // Attempt to send the verification email
      await sendEmailVerification(user);
      message.success("Verification email resent! Please check your inbox.");
    } catch (error) {
      // Log specific error details for more insight
      console.error("Error resending email verification:", error);
      if (error.code === 'auth/too-many-requests') {
        message.error("Too many requests. Please wait and try again later.");
      } else {
        message.error("Failed to resend verification email. Please try again later.");
      }
    }
  };

  return (
    <div className="amihana-bg flex justify-center" style={{ backgroundColor: "#E9F5FE" }}>
      <div className="min-h-screen desktop:w-[54rem] laptop:w-[44rem] phone:w-full flex justify-center items-center flex-col bg-[#E9F5FE]">
        <div className="flex justify-center items-center flex-col">
          <img
            src={amihanaLogo}
            alt="Amihana logo"
            className="desktop:w-[21rem] phone:w-[16rem] mb-8"
          />
          <h1 className="text-center font-[Poppins] text-3xl font-semibold mb-4">
            Email Confirmation
          </h1>
          <p className="text-center font-[Poppins] text-lg mb-6 px-6">
            We've sent a confirmation email to your registered email address.
            Please check your inbox and click the link to verify your email.
          </p>
          <Button
            type="primary"
            style={{ backgroundColor: "#0C82B4", borderColor: "#0C82B4", width: "10rem" }}
            size="large"
            onClick={handleResendConfirmation}
          >
            Resend Confirmation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
