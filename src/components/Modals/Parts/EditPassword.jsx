import React, { useState } from 'react';
import { Input, Button, message, Modal } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        message.error('User not authenticated.');
        setIsLoading(false);
        return;
      }

      // Check if the new password matches the old password
      if (newPassword === oldPassword) {
        message.error('New password cannot be the same as the old password.');
        setIsLoading(false);
        return;
      }

      // Check if the new password and confirm password match
      if (newPassword !== confirmPassword) {
        message.error('New password and confirm password do not match.');
        setIsLoading(false);
        return;
      }

      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);
      
      // Show confirmation modal
      Modal.confirm({
        title: 'Password Changed Successfully',
        content: 'Would you like to log out or stay logged in?',
        okText: 'Log Out',
        cancelText: 'Stay Logged In',
        onOk: () => {
          signOut(auth)
            .then(() => {
              navigate('/'); // Redirect to login page after logout
            })
            .catch((error) => {
              message.error('Error logging out. Please try again.');
              console.error('Logout error:', error);
            });
        },
        onCancel: () => {
          message.success('You can continue using your account.');
        },
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
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