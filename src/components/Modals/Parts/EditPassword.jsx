import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, SaveOutlined } from '@ant-design/icons';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Simulate password change logic here
    setTimeout(() => {
      setIsLoading(false);
      alert('Password changed successfully!');
    }, 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 phone:p-4 laptop:p-8 bg-white rounded-lg shadow-lg transition-all transform duration-500 ease-in-out">
      <h2 className="text-2xl font-semibold text-center mb-6">Change Password</h2>
      
      <div className="space-y-4">
        {/* Old Password */}
        <Input.Password
          placeholder="Enter old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          prefix={<LockOutlined />}
          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          className="w-full p-2 border rounded-md"
        />
        
        {/* New Password */}
        <Input.Password
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          prefix={<LockOutlined />}
          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          className="w-full p-2 border rounded-md"
        />
        
        {/* Confirm Password */}
        <Input.Password
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          prefix={<LockOutlined />}
          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={isLoading}
        onClick={handleSave}
        className="mt-6 w-full laptop:w-auto laptop:ml-auto phone:w-full"
      >
        {isLoading ? 'Saving...' : 'Change Password'}
      </Button>
    </div>
  );
}
