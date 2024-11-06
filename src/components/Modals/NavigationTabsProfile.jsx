import React, { useState } from 'react';
import { Button } from 'antd';
import { UserOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import ProfileContent from './Parts/ProfileContent';
import EditProfileContent from './Parts/EditProfileContent';
import EditPassword from './Parts/EditPassword'

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex justify-center bg-white shadow-md rounded-lg">
        <div className="flex-row flex py-2">
          <Button
            type="link"
            icon={<UserOutlined />}
            onClick={() => setActiveTab('part-1')}
          >
        
          </Button>
          <Button
            type="link"
            icon={<SettingOutlined />}
            color="#0C82B4"
            onClick={() => setActiveTab('part-2')}
          >
            
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => setActiveTab('part-3')}
          >
           
          </Button>
        </div>
      </div>
      <div className="flex flex-col flex-grow items-center p-4">
        <main className="w-full max-w-7xl bg-white rounded-lg shadow-md p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default NavigationTabsProfile;
