import React, { useState, useEffect } from 'react';
import { Button, Input, Upload } from 'antd';
import { EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import ProfilePreview from '../../ProfilePreview';
import { db } from '../../../firebases/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const { TextArea } = Input;

const EditProfileContent = () => {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    age: "",
    bio: "", // Added bio field
  });
  const [isEditing, setIsEditing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(""); // For profile picture upload

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setHomeOwner(userData);
            setProfilePicture(userData.profilePicture); // Initialize profilePicture state
            localStorage.setItem('homeOwner', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomeOwner((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (info) => {
    if (info.file.status === 'done') {
      // Update profile picture URL from response
      setProfilePicture(info.file.response.url); // Make sure your response contains this field
    }
  };

  const handleSave = async () => {
    setButtonLoading(true);
    try {
      const user = getAuth().currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          ...homeOwner,
          profilePicture, // Save the updated profile picture URL
        });
        localStorage.setItem('homeOwner', JSON.stringify(homeOwner));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('User not authenticated!');
      }
    } catch (error) {
      console.error('Error updating document: ', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="w-full max-w-7xl bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl phone:text-xl laptop:text-2xl font-semibold">
          {isEditing ? 'Edit Profile' : 'View Profile'}
        </h2>
        <Button
          type="primary"
          icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
          loading={buttonLoading}
          onClick={handleButtonClick}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </div>

      <div className="flex flex-col laptop:flex-row laptop:space-x-10">
        <div className="w-full laptop:w-1/3 flex justify-center mb-4 laptop:mb-0">
          <ProfilePreview homeOwner={homeOwner} />
        </div>

        <div className="w-full laptop:w-2/3 bg-white p-2 laptop:p-4 rounded-s shadow-md">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600">Profile Picture</label>
              {isEditing ? (
                <Upload
                  name="profilePicture"
                  listType="picture-card"
                  showUploadList={false}
                  action="/upload"
                  onChange={handleProfilePictureChange}
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" style={{ width: '100%' }} />
                  ) : (
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  )}
                </Upload>
              ) : (
                <img src={homeOwner.profilePicture} alt="Profile" style={{ width: '100%' }} />
              )}
            </div>
            <div>
              <label className="block text-gray-600">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={homeOwner.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-base phone:text-base laptop:text-lg font-medium break-words">{homeOwner.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={homeOwner.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-base phone:text-base laptop:text-lg font-medium break-words">{homeOwner.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={homeOwner.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-base phone:text-base laptop:text-lg font-medium break-words">{homeOwner.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={homeOwner.age}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-base phone:text-base laptop:text-lg font-medium break-words">{homeOwner.age}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600">Bio</label>
              {isEditing ? (
                <TextArea
                  name="bio"
                  value={homeOwner.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-base phone:text-base laptop:text-lg font-medium break-words">{homeOwner.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileContent;
