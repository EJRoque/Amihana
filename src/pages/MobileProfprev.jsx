import React, { useState } from 'react';
import { Avatar, Typography, Button, Modal } from 'antd';
import { MailOutlined, PhoneOutlined, SettingOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import EditProfileContent from '../components/Modals/Parts/EditProfileContent';
import EditPassword from '../components/Modals/Parts/EditPassword';
import { getAuth } from "firebase/auth";
import { useNavigate } from 'react-router-dom';  // Assuming you're using react-router for navigation

const { Title, Paragraph } = Typography;

export default function MobileProfprev({ homeOwner }) {
    const [activeTab, setActiveTab] = useState('1');
    const navigate = useNavigate();  // Hook to navigate

    // Function to render content based on activeTab value
    const renderContent = () => {
        switch (activeTab) {
            case '2':
                return <EditProfileContent />;
            case '3':
                return <EditPassword />;
            default:
                return (
                    <div className='flex flex-col items-center'>
                        <Avatar
                            size={100}
                            icon={<UserOutlined />}
                            className="mb-4"
                            src={homeOwner.profilePicture}
                        />
                        <div className='flex flex-col items-center justify-center'>
                            <Title level={3} className="font-poppins">
                                {homeOwner.fullName || 'No name available'}
                            </Title>
                            <Paragraph level={5} className="font-poppins">
                                {homeOwner.email || 'No email available'}
                            </Paragraph>
                            <Paragraph level={5} className="font-poppins">
                                {homeOwner.phoneNumber || 'No phone available'}
                            </Paragraph>
                        </div>
                    </div>
                );
        }
    };

    const handleLogout = () => {
        // Show confirmation modal before logging out
        Modal.confirm({
            centered: true,
            title: 'Are you sure you want to log out?',
            content: 'You will need to log in again to access your account.',
            okText: 'Log Out',
            cancelText: 'Cancel',
            onOk: () => {
                const auth = getAuth();
                auth.signOut().then(() => {
                    navigate("/");  // Navigate to the home or login page after logging out
                    console.log('User logged out');
                }).catch((error) => {
                    console.error('Error logging out:', error);
                });
            },
            onCancel: () => {
                console.log('Logout cancelled');
            }
        });
    };

    return (
        <div className='font-poppins flex flex-col w-full h-auto justify-between gap-7 items-center relative'>
            
            {/* Back Button */}
            {activeTab !== '1' && (
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setActiveTab('1')}
                    className="absolute top-0 left-0 bg-gray-200 text-gray-800"
                >
                    Back
                </Button>
            )}

            {/* Title */}
            <div className='mb-auto my-4'>
                <Title level={5} className='font-poppins'>Profile</Title>
            </div>
            
            {/* Render Profile Content or Edit Components */}
            {renderContent()}
            
            {/* Navigations - Only show when not on EditProfile or EditPassword screens */}
            {activeTab === '1' && (
                <div className='bg-white w-[90%] h-[70%] flex rounded-md mt-4'>
                    <div className='flex flex-col items-center m-4 w-full h-full space-y-1'>
                        <Button
                            className='bg-gray-200 text-gray-800 w-full h-10'
                            onClick={() => setActiveTab('2')}
                        >
                            <UserOutlined /> Edit Profile
                        </Button>
                        <Button
                            className='bg-gray-200 text-gray-800 w-full h-10'
                            onClick={() => setActiveTab('3')}
                        >
                            <SettingOutlined /> Change Password
                        </Button>
                    </div>
                </div>
            )}

            {/* Log Out Button - Only show when on Profile tab (activeTab === '1') */}
            {activeTab === '1' && (
                <Button
                    className="m-4 w-[80%] mt-32 h-10 border-2  border-red-500 text-red-500"
                    onClick={handleLogout}
                >
                    Log Out
                </Button>
            )}
        </div>
    );
}
