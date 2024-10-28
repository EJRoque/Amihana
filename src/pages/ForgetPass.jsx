import React, { useState } from "react";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebases/FirebaseConfig"; // Correct import path
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Steps } from "antd"; // Ant Design components

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // const handleSubmit = async () => {
  //   setError("");

  //   // try {
  //   //   await sendPasswordResetEmail(auth, email);
  //   //   alert("Password reset email sent. Check your email.");
  //   //   navigate("/forget-password");
  //   // } catch (err) {
  //   //   setError(err.message);
  //   // }
  // };

  const handleTransition = async () =>{
    Steps(current)
  }



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
                current={0}
                
                items={[
                  { title: 'Find Email', 
                    description: 'Search for your Email',
                  },
                  {
                    title: 'In Progress',
                    description: 'Searching...',
                  },
                  {
                    title: 'Send Password Reset Link',
                    description: 'Input your Personal Email'
                  },
                ]}/>
                <Steps 
                  className="desktop:hidden laptop:hidden phone:hidden"
                  direction="vertical"
                  size="small"
                  current={0}
                  
                  items={[
                    { title: 'Find Email', 
                      description: 'Search for your Email',
                    },
                    {
                      title: 'In Progress',
                      description: 'Searching...',
                    },
                    {
                      title: 'Send Password Reset Link',
                      description: 'Input your Personal Email'
                    },
                  ]}
                />
                <Steps 
                  className="laptop:hidden phone:hidden tablet:hidden"
                  direction="horizontal"
                  size="small"
                  current={0}
                  
                  items={[
                    { title: 'Find Email', 
                      description: 'Search for your Email',
                    },
                    {
                      title: 'In Progress',
                      description: 'Searching...',
                    },
                    {
                      title: 'Send Password Reset Link',
                      description: 'Input your Personal Email'
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

                <Button 
                  responsive
                  onClick={handleTransition}
                  type="primary"
                  block

                >
                  Find Email 
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
