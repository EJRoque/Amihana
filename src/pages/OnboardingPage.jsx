import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Upload } from "antd";
import amihanaLogo from "../assets/images/amihana-logo.png";
import defaultProfilePic from "../assets/images/default-profile-pic.png";
import { fetchNames } from "../firebases/firebaseFunctions"; // Import the function for fetching data from Firebase

const { Option } = Select;

const OnboardingPage = ({
  account,
  setAccount,
  imagePreview,
  setImagePreview,
}) => {
  const navigate = useNavigate();
  const [nameSuggestions, setNameSuggestions] = useState([]); // Holds all names from Firebase
  const [filteredNames, setFilteredNames] = useState([]); // Holds the filtered names based on input
  const [showSuggestions, setShowSuggestions] = useState(false); // Controls suggestion visibility

  


    // Fetch all names on component mount
  useEffect(() => {
    const fetchAndSetNames = async () => {
      const names = await fetchNames(); // Fetching names from Firestore
      setNameSuggestions(names); // Set the full list of names
    };

    fetchAndSetNames(); // Call the function to fetch names
  }, []);

  const handleSuggestionClick = (name) => {
    setAccount((prevAccount) => ({
      ...prevAccount,
      fullName: name,
    }));
    setShowSuggestions(false); // Hide suggestions when user selects a name
  };

 
  const handleChange = (name) => (value) => {
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));

    if (name === 'fullName') {
      if (value.trim() !== "") {
        const filtered = nameSuggestions.filter((n) =>
          n.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredNames(filtered); // Update the filtered names
        setShowSuggestions(true); // Show the suggestions dropdown
      } else {
        setShowSuggestions(false); // Hide suggestions if input is empty
      }
    }
  };

  const handleImageChange = (info) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      setAccount((prevAccount) => ({
        ...prevAccount,
        profilePicture: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (values) => {
    navigate("/review-onboarding");
  };


  return (
    <div className="amihana-bg flex justify-center">
      <div className="min-h-screen desktop:w-[54rem] laptop:w-[44rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex justify-center items-center flex-col">
          <div className="flex desktop:w-[21rem] phone:w-[16rem] mb-1">
            <img
              src={amihanaLogo}
              alt="Amihana logo"
              className="desktop:w-[21rem] phone:w-[16rem]"
            />
          </div>

          <Form onFinish={handleSubmit} className="flex flex-col" layout="vertical">
            <h1 className="text-center font-[Poppins] desktop:text-4xl laptop:text-3xl phone:text-2xl font-normal desktop:mb-5 laptop:mb-3 phone:mb-3">
              Create Account
            </h1>

            <Form.Item label="Profile Picture" name="profilePicture">
              <Upload
                accept=".jpg, .jpeg, .png"
                showUploadList={false}
                onChange={handleImageChange}
                maxCount={1}
              >
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={imagePreview || defaultProfilePic}
                    alt="Profile Preview"
                    className="desktop:w-16 desktop:h-16 laptop:w-14 laptop:h-14 phone:w-12 phone:h-12 object-cover rounded-full mb-2"
                  />
                  <Button>Upload</Button>
                </div>
              </Upload>
            </Form.Item>

            <div className="grid grid-cols-1 gap-4 mt-4 tablet:grid-cols-2">
            <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <div className="relative"> {/* Wrapper div around the input and dropdown */}
            <Input
              placeholder="ex. Dela Cruz, Juan"
              value={account.fullName}
              onChange={(e) => handleChange('fullName')(e.target.value)}
            />

            {/* Render the suggestions list */}
            {showSuggestions && filteredNames.length > 0 && (
              <ul className="absolute z-50 w-full bg-white shadow-lg rounded-lg mt-1 max-h-48 overflow-y-auto border border-gray-200">
                {filteredNames.map((name, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(name)}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Form.Item>


              <Form.Item
                label="Phone Number"
                name="phoneNumber"
                rules={[{ required: true, min: 11, message: 'Please enter a valid phone number!' }]}
              >
                <Input
                  placeholder="Enter phone number"
                  value={account.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber')(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Age"
                name="age"
                rules={[{ required: true, message: 'Please enter your age!' }]}
              >
                <Input
                  placeholder="Enter age"
                  value={account.age}
                  onChange={(e) => handleChange('age')(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Phase"
                name="phase"
                rules={[{ required: true, message: 'Please enter your phase!' }]}
              >
                <Input
                  placeholder="Enter phase"
                  value={account.phase}
                  onChange={(e) => handleChange('phase')(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Block"
                name="block"
                rules={[{ required: true, message: 'Please enter your block!' }]}
              >
                <Input
                  placeholder="Enter block"
                  value={account.block}
                  onChange={(e) => handleChange('block')(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Lot"
                name="lot"
                rules={[{ required: true, message: 'Please enter your lot!' }]}
              >
                <Input
                  placeholder="Enter lot"
                  value={account.lot}
                  onChange={(e) => handleChange('lot')(e.target.value)}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 tablet:grid-cols-2">
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select a category!' }]}
              >
                <Select
                  placeholder="Select Category"
                  value={account.category}
                  onChange={handleChange('category')}
                >
                  <Option value="Homeowner">Homeowner</Option>
                  <Option value="Tenant">Tenant</Option>
                </Select>
              </Form.Item>

              {account.category === "Tenant" && (
                <Form.Item
                  label="Full Address"
                  name="tenantAddress"
                  rules={[{ required: true, message: 'Please enter your address!' }]}
                >
                  <Input
                    placeholder="house #, Brgy, Municipality, Province"
                    value={account.tenantAddress}
                    onChange={(e) => handleChange('tenantAddress')(e.target.value)}
                  />
                </Form.Item>
              )}
            </div>

            <div className="flex justify-center my-5">
              <Button type="primary" htmlType="submit" className="desktop:w-[21rem] phone:w-[16rem]">
                Next
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
