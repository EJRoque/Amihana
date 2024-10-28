import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { HiEye, HiEyeOff } from "react-icons/hi";

const SignupPage = ({ account, setAccount }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (name) => (value) => {
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };

  const handleSubmit = (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    console.log(values); // Keep your existing logic
    navigate("/onboarding");
  };

  return (
    <div className="amihana-bg flex justify-center">
      <div className="h-screen desktop:w-[34rem] laptop:w-[24rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex flex-col">
          <div className="desktop:w-[21rem] phone:w-[16rem] mb-3">
            <img src={amihanaLogo} alt="Amihana logo" />
          </div>
          <Form
            onFinish={handleSubmit}
            className="flex flex-col"
            layout="vertical"
            requiredMark={false}
          >
            <h1 className="text-center font-[Poppins] desktop:text-4xl laptop:text-3xl phone:text-2xl font-normal desktop:mb-5 laptop:mb-3 phone:mb-3">
              Create Account
            </h1>

            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
              <Input
                placeholder="sample@email.com"
                value={account.email}
                onChange={(e) => handleChange('email')(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[{ required: true, min: 8, message: 'Password must be at least 8 characters!' }]}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={account.password}
                onChange={(e) => handleChange('password')(e.target.value)}
                suffix={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <HiEyeOff /> : <HiEye />}
                  </button>
                }
              />
            </Form.Item>

            <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 8, message: 'Please confirm your password!' }]}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={account.confirmPassword}
                onChange={(e) => handleChange('confirmPassword')(e.target.value)}
                suffix={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <HiEyeOff /> : <HiEye />}
                  </button>
                }
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="desktop:w-full">
                Next
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
