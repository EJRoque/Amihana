import React, { useState } from 'react';
import { Upload, Button, Input, Form, message } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const Part2Component = () => {
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      setImage(info.file.response.url); // Assuming the URL is returned from the server
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleImageUpload = () => {
    // Implement the image upload logic here
  };

  return (
    <div className="w-full max-w-7xl bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Update Profile Picture and Bio</h2>
      
      <Form
        layout="vertical"
        initialValues={{ bio }}
        onFinish={(values) => {
          console.log('Form values:', values);
          // Handle form submission logic here
        }}
      >
        {/* Profile Picture Upload */}
        <Form.Item label="Profile Picture" name="profilePicture">
          <Upload
            name="file"
            listType="picture"
            className="upload-list-inline"
            showUploadList={false}
            action="/upload" // Replace with your upload URL
            onChange={handleImageChange}
            beforeUpload={() => false} // Prevent automatic upload
          >
            <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
          </Upload>
          {image && <img src={image} alt="Profile" className="mt-2 w-32 h-32 object-cover rounded-full" />}
        </Form.Item>

        {/* Bio Input Field */}
        <Form.Item label="Bio" name="bio">
          <TextArea
            rows={4}
            placeholder="Enter your bio"
            value={bio}
            onChange={handleBioChange}
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Part2Component;
