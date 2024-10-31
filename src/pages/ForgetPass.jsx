import React, { useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebases/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Steps, message, Spin } from "antd";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailCheck = async () => {
    setError("");
    setLoading(true); // Start loading
    setCurrentStep(1); // Move to the "In Progress" step

    // Simulate a 2-second animation delay
    setTimeout(async () => {
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);

        if (signInMethods.length === 0) {
          setError("This email is not registered. Please try again.");
          message.error("This email is not registered. Please try again.");
          setCurrentStep(0); // Go back to the first step
        } else {
          setCurrentStep(2); // Move to the "Send Password Reset Link" step
          message.success("Email found! Please proceed to send the reset link.");
        }
      } catch (err) {
        setError("Error checking email. Please try again later.");
        message.error("Error checking email. Please try again later.");
        setCurrentStep(0); // Go back to the first step
      } finally {
        setLoading(false); // Stop loading
      }
    }, 2000); // 2-second delay
  };

  const handleSendResetLink = async () => {
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      message.success("Password reset email sent. Check your email.");
      navigate("/"); // Redirect to the login page
    } catch (err) {
      setError(err.message);
      message.error(err.message);
    }
  };

  return (
    <div className="amihana-bg flex justify-center">
      <div className="h-screen desktop:w-[54rem] laptop:w-[44rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-3">
            <img src={amihanaLogo} alt="Amihana logo" />

            <h2 className="text-center mt-12 font-[Poppins] font-medium my-4 desktop:text-4xl laptop:text-3xl phone:text-2xl desktop:mb-5 laptop:mb-3 phone:mb-3">
              Find Email
            </h2>
            <div className="flex flex-col justify-center items-center space-y-4">
              <Steps
                className="tablet:hidden desktop:hidden laptop:hidden"
                responsive
                size="small"
                current={currentStep}
                items={[
                  {
                    title: "Find Email",
                    description: "Search for your Email",
                  },
                  {
                    title: "In Progress",
                    description: (
                      <div>
                        Searching...
                        {loading && <Spin size="small" className="ml-2" />}
                      </div>
                    ),
                  },
                  {
                    title: "Send Password Reset Link",
                    description: "Input your Personal Email",
                  },
                ]}
              />
              <Steps
                className="desktop:hidden laptop:hidden phone:hidden"
                direction="vertical"
                size="small"
                current={currentStep}
                items={[
                  {
                    title: "Find Email",
                    description: "Search for your Email",
                  },
                  {
                    title: "In Progress",
                    description: (
                      <div>
                        Searching...
                        {loading && <Spin size="small" className="ml-2" />}
                      </div>
                    ),
                  },
                  {
                    title: "Send Password Reset Link",
                    description: "Input your Personal Email",
                  },
                ]}
              />
              <Steps
                className="laptop:hidden phone:hidden tablet:hidden"
                direction="horizontal"
                size="small"
                current={currentStep}
                items={[
                  {
                    title: "Find Email",
                    description: "Search for your Email",
                  },
                  {
                    title: "In Progress",
                    description: (
                      <div>
                        Searching...
                        {loading && <Spin size="small" className="ml-2" />}
                      </div>
                    ),
                  },
                  {
                    title: "Send Password Reset Link",
                    description: "Input your Personal Email",
                  },
                ]}
              />
              <Form layout="vertical">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Input Email Address"
                    className="desktop:w-[21rem] phone:w-[16rem]"
                  />
                </Form.Item>

                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                {currentStep === 0 && (
                  <Button onClick={handleEmailCheck} type="primary" block>
                    Find Email
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button onClick={handleSendResetLink} type="primary" block>
                    Send Reset Link
                  </Button>
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
