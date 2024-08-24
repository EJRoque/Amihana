import React from 'react';
import { Avatar, Typography, Divider } from 'antd';
import { MailOutlined, PhoneOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function ProfileContent({ homeOwner }) {
    if (!homeOwner) {
      return <div>Loading...</div>; // Or any loading state
    }
    
    return (
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-4 mx-auto">
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <Avatar
            size={100}
            icon={<UserOutlined />}
            className="mb-4"
            src={homeOwner.profilePicture} // Default image if none provided
          />
          
          {/* Name */}
          <Title level={2} className="font-poppins">{homeOwner.fullName || 'No name available'}</Title>
          {/* Bio */}
          <Paragraph className="text-center font-poppins mb-4">
            {homeOwner.bio || 'No bio available.'}
          </Paragraph>
  
          <Divider />
  
          {/* Contact Information */}
          <div className="w-full text-center">
            <div className="mb-2 flex items-center justify-center">
              <MailOutlined className="mr-2" />
              <span className="font-poppins">{homeOwner.email || 'No email available.'}</span>
            </div>
            <div className="mb-2 flex items-center justify-center">
              <PhoneOutlined className="mr-2" />
              <span className="font-poppins">{homeOwner.phoneNumber || 'No phone number available.'}</span>
            </div>
            <div className="mb-2 flex items-center justify-center">
              <CalendarOutlined className="mr-2" />
              <span className="font-poppins">{homeOwner.age || 'Age not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  