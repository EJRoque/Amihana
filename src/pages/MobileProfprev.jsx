import React, { useState } from 'react'
import { Avatar, Typography, Button } from 'antd';
import { MailOutlined, PhoneOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
const { Title, Paragraph } = Typography;
import { getAuth, onAuthStateChanged } from "firebase/auth";
import EditProfileContent from '../components/Modals/Parts/EditProfileContent';
import EditPassword from '../components/Modals/Parts/EditPassword';


export default function MobileProfprev({ homeOwner }) {

    const [activeTab, setActiveTab] = useState('1');

    const content1 = () => {
        switch (activeTab) {
          case '1':
            return <MobileProfprev homeOwner={homeOwner} />;
          case '2':
            return <EditProfileContent />;
          case '3':
            return <EditPassword />;
          default:
            return <MobileProfprev homeOwner={homeOwner} />;
        }
      };

  return (
    <>
        <div className='font-poppins flex flex-col w-full h-full justify-center items-center'>
            
            <div className='mb-auto'>
                <Title level={5} className='font-poppins'>Profile</Title>
            </div>
                
            <div className='flex flex-col items-center'>
                <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    className="mb-4"
                    src={homeOwner.profilePicture} // Default image if none provided
                />
                <div className='flex flex-col items-center justify-center'>
                    <Title level={3} className="font-poppins">
                        {homeOwner.fullName || 'No name available'}
                    </Title>
                    <Paragraph level={5} className="font-poppins">
                        {homeOwner.email || 'No name available'}
                    </Paragraph>
                </div>
            </div>

            {/* Navigations */}
            <div className='bg-white w-[90%] h-[70%] shadow-md flex rounded-md'>
                <div className='flex flex-col items-center m-4 w-full h-full space-y-1'>

                    <Button className='bg-gray-200 text-gray-800 w-full h-10'
                            onClick={(value) => setActiveTab(value)}>
                        <UserOutlined />
                            Profile
                    </Button>
                    <Button className='bg-gray-200 text-gray-800 w-full h-10'>
                        <SettingOutlined />
                            Settings
                    </Button>
                </div>
            </div>
            

        </div>
    </>
  )
}

