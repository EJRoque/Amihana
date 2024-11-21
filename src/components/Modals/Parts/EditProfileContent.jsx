import React, { useState, useEffect } from 'react';
import { Button, Input, message, Modal, Form, Row, Col } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { db, storage } from '../../../firebases/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, updateEmail, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const { TextArea } = Input;

const EditProfileContent = ({ onProfileUpdate }) => {
  const [homeOwner, setHomeOwner] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
    age: '',
    aboutMe: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [emailVerifyModalVisible, setEmailVerifyModalVisible] = useState(false);

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
        console.error('No authenticated user found');
        message.error('User not authenticated.');
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      if (homeOwner.email !== user.email) {
        setEmailVerifyModalVisible(true); // Prompt for email verification
      } else {
        await updateProfile();
      }
    } else {
      alert('User not authenticated!');
    }
  };

  const handleEmailVerification = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        // Send verification email to the new email address
        await updateEmail(user, homeOwner.email);
        await sendEmailVerification(user);

        message.info('Verification email sent. Please verify to confirm the email change.');

        // Periodically check for verification status
        const intervalId = setInterval(async () => {
          await user.reload(); // Refresh user data
          if (user.emailVerified) {
            clearInterval(intervalId); // Stop polling
            await updateProfile(); // Commit changes once verified
            message.success('Email verified and changes saved successfully!');
          }
        }, 3000); // Check every 3 seconds

        // Timeout the verification process after 5 minutes
        setTimeout(() => {
          clearInterval(intervalId);
          message.error('Email verification timed out. Please try again.');
        }, 300000); // 5 minutes
      } catch (error) {
        console.error('Error during email verification:', error);
        message.error('Failed to send verification email. Please try again.');
      } finally {
        setEmailVerifyModalVisible(false); // Close the modal
      }
    }
  };

  const updateProfile = async () => {
    setButtonLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);

      // Update Firestore user data
      await updateDoc(userDocRef, {
        ...homeOwner,
        profilePicture,
      });

      setHomeOwner((prevState) => ({
        ...prevState,
        profilePicture,
      }));

      localStorage.setItem('homeOwner', JSON.stringify({ ...homeOwner, profilePicture }));
      setIsEditing(false);
      message.success('Profile updated successfully!');

      if (onProfileUpdate) {
        onProfileUpdate(profilePicture);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please try again.');
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
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">{isEditing ? 'Edit Profile' : 'View Profile'}</h2>
        <Button
          type="primary"
          icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
          loading={buttonLoading}
          onClick={handleButtonClick}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </div>

      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={24} lg={8}>
            <div className="w-full flex justify-center mb-6">
              <img
                src={previewUrl || homeOwner.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {isEditing && (
              <div className="w-full">
                <label className="block text-gray-700 mb-2">Upload New Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={uploading}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </Col>

          <Col span={24} lg={16}>
            <div className="space-y-6">
              <Form.Item label="Name">
                {isEditing ? (
                  <Input name="fullName" value={homeOwner.fullName} onChange={handleChange} />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.fullName}</p>
                )}
              </Form.Item>
              <Form.Item label="Email" required>
                {isEditing ? (
                  <Input name="email" value={homeOwner.email} onChange={handleChange} type="email" />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.email}</p>
                )}
              </Form.Item>
              <Form.Item label="Phone" required>
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={homeOwner.phoneNumber}
                    onChange={handleChange}
                    type="tel"
                  />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.phoneNumber}</p>
                )}
              </Form.Item>
              <Form.Item label="Age">
                {isEditing ? (
                  <Input type="number" name="age" value={homeOwner.age} onChange={handleChange} />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.age}</p>
                )}
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Email Verification"
        open={emailVerifyModalVisible}
        onCancel={() => setEmailVerifyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEmailVerifyModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="verify" type="primary" onClick={handleEmailVerification}>
            Send Verification Email
          </Button>,
        ]}
      >
        <p>
          A verification email will be sent to <strong>{homeOwner.email}</strong>. Please confirm
          your email to proceed with the change.
        </p>
      </Modal>
    </div>
  );
};

export default EditProfileContent;
