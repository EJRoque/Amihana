import React, { useState, useEffect } from 'react';
import { Button, Input, message, Modal, Form, Row, Col } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import ProfilePreview from '../../ProfilePreview';
import { db, storage } from '../../../firebases/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const { TextArea } = Input;

const EditProfileContent = ({ onProfileUpdate }) => {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    age: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");

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
    const user = getAuth().currentUser;
    if (user) {
      if (homeOwner.email !== user.email) {
        setModalVisible(true);
      } else {
        await updateProfile();
      }
    } else {
      alert('User not authenticated!');
    }
  };

  const updateProfile = async () => {
    setButtonLoading(true);
    try {
      const user = getAuth().currentUser;
      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        ...homeOwner,
        profilePicture,
      });

      await updateEmail(user, homeOwner.email);

      setHomeOwner(prevState => ({
        ...prevState,
        profilePicture,
      }));

      localStorage.setItem('homeOwner', JSON.stringify({ ...homeOwner, profilePicture }));
      setIsEditing(false);
      alert('Profile updated successfully!');

      if (onProfileUpdate) {
        onProfileUpdate(profilePicture);
      }
    } catch (error) {
      console.error('Error updating document: ', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleModalOk = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(user.email, password);
      try {
        await reauthenticateWithCredential(user, credential);
        await updateProfile();
      } catch (error) {
        message.error('Incorrect password. Please try again.');
        setPassword(""); // Clear the password field upon error
      } finally {
        // Always close the modal after attempting to update
        setModalVisible(false);
      }
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false); // Close the modal without saving
    setPassword(""); // Clear the password input
  };

  const handleButtonClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleModalShow = () => {
    setModalVisible(true);
    setPassword(""); // Clear the password input when modal opens
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
              {/* Profile Picture displayed as a square */}
              {isEditing && (
                <div>
                  <label className="block text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={uploading}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
              <img
                src={previewUrl || homeOwner.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover" // Ensuring square appearance without rounding
              />
            </div>
          </Col>

          <Col span={24} lg={16}>
            <div className="space-y-6">
              <Form.Item label="Name">
                {isEditing ? (
                  <Input
                    name="fullName"
                    value={homeOwner.fullName}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.fullName}</p>
                )}
              </Form.Item>
              <Form.Item label="Email">
                {isEditing ? (
                  <Input
                    name="email"
                    value={homeOwner.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.email}</p>
                )}
              </Form.Item>
              <Form.Item label="Phone">
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={homeOwner.phoneNumber}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.phoneNumber}</p>
                )}
              </Form.Item>
              <Form.Item label="Age">
                {isEditing ? (
                  <Input
                    type="number"
                    name="age"
                    value={homeOwner.age}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-lg font-medium">{homeOwner.age}</p>
                )}
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Confirm Password"
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p>Please enter your password to confirm your changes:</p>
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <p className="text-gray-600 text-sm mt-2">
          We need to verify your identity before making any changes.
        </p>
      </Modal>
    </div>
  );
};

export default EditProfileContent;
