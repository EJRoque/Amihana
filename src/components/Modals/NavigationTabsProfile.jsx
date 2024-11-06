import React, { useState } from 'react';
import { UserOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import ProfileContent from './Parts/ProfileContent';
import EditProfileContent from './Parts/EditProfileContent';
import EditPassword from './Parts/EditPassword';

const NavigationTabsProfile = ({ homeOwner }) => {
  const [activeTab, setActiveTab] = useState('part-1');

  const renderContent = () => {
    switch (activeTab) {
      case 'part-1':
        return <ProfileContent homeOwner={homeOwner} />;
      case 'part-2':
        return <EditProfileContent />;
      case 'part-3':
        return <EditPassword />;
      default:
        return <ProfileContent homeOwner={homeOwner} />;
    }
  };

  return (
    <div className="h-auto w-full flex flex-col bg-gray-100">
      <div className="flex justify-center bg-white shadow-md rounded-lg p-4 h-auto w-auto">
        <Segmented
          options={[
            { label: 'Profile', value: 'part-1', icon: <UserOutlined /> },
            { label: 'Edit Profile', value: 'part-2', icon: <SettingOutlined /> },
            { label: 'Password', value: 'part-3', icon: <KeyOutlined /> },
          ]}
          className='bg-[#B9D9EB]'
          value={activeTab}
          onChange={(value) => setActiveTab(value)}
        />
      </div>
      <div className="w-auto h-auto flex flex-col flex-grow items-center p-4">
        <main className="w-full h-full bg-white rounded-lg shadow-md p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default NavigationTabsProfile;
