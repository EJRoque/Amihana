import React, { useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebases/FirebaseConfig"; // Correct import path
import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd"; // Ant Design components

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your email.");
      navigate("/forget-password");
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
            <h2 className="text-center font-[Poppins] my-4 desktop:text-4xl laptop:text-3xl phone:text-2xl font-normal desktop:mb-5 laptop:mb-3 phone:mb-3">
                Forget Password
              </h2>
              <Form onFinish={handleSubmit} layout="vertical">
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

                <Button
                  type="primary"
                  htmlType="submit"
                  className="mt-4 desktop:w-[21rem] phone:w-[16rem] bg-blue-500"
                >
                  Send Reset Email
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
