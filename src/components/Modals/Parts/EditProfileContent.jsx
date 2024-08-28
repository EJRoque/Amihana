import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import ProfilePreview from '../../ProfilePreview';
import { db, storage } from '../../../firebases/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const { TextArea } = Input;

const EditProfileContent = ({ onProfileUpdate }) => {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    age: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setHomeOwner(userData);
            setProfilePicture(userData.profilePicture);
            setPreviewUrl(userData.profilePicture);
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

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      setUploading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          () => {},
          (error) => {
            message.error('Failed to upload profile picture.');
            setUploading(false);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setProfilePicture(downloadURL);
              setUploading(false);
              message.success('Profile picture uploaded successfully!');
            });
          }
        );
      } else {
        console.error("No authenticated user found");
        message.error('User not authenticated.');
        setUploading(false);
      }
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
          profilePicture,
        });

        setHomeOwner(prevState => ({
          ...prevState,
          profilePicture,
        }));

        localStorage.setItem('homeOwner', JSON.stringify({ ...homeOwner, profilePicture }));
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        // Notify parent component or context about profile update
        if (onProfileUpdate) {
          onProfileUpdate(profilePicture);
        }
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={uploading}
                />
              ) : (
                <img
                  src={previewUrl || homeOwner.profilePicture}
                  alt="Profile"
                  style={{ width: '100%' }}
                />
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