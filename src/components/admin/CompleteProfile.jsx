import { useState, useEffect } from "react";
import { db } from "../../firebases/FirebaseConfig";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import { message, Input, Button, Select, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import defaultProfilePic from "../../assets/images/default-profile-pic.png"; // Replace with your actual default profile picture

const { Option } = Select;

const CompleteProfile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    phoneNumber: "",
    age: "",
    phase: "",
    block: "",
    lot: "",
    category: "",
    profilePicture: null, // Optional
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user || !user.uid) {
          console.log("No user found in auth");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data());
          setImagePreview(userDoc.data().profilePicture || null); // Load profile picture if available
        } else {
          message.warning("Please complete your profile.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Failed to load user data.");
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleImageChange = (info) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      setProfile((prev) => ({ ...prev, profilePicture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const { fullName, phoneNumber, age, phase, block, lot, category } = profile;

    if (!fullName || !phoneNumber || !age || !phase || !block || !lot || !category) {
      message.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        ...profile,
        profileCompleted: true,
        profilePicture: imagePreview || null, // Save profile picture or null
      });

      await updateProfile(user, {
        displayName: fullName,
      });

      message.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amihana-bg flex justify-center">
      <div className="min-h-screen desktop:w-[54rem] laptop:w-[44rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex justify-center items-center flex-col">
          <h1 className="text-center font-[Poppins] desktop:text-4xl laptop:text-3xl phone:text-2xl font-normal mb-5">
            Complete Your Profile
          </h1>

          <div className="flex flex-col items-center justify-center mb-5">
            <Upload
              accept=".jpg, .jpeg, .png"
              showUploadList={false}
              onChange={handleImageChange}
              maxCount={1}
            >
              <div className="flex flex-col items-center">
                <img
                  src={imagePreview || defaultProfilePic}
                  alt="Profile Preview"
                  className="desktop:w-16 desktop:h-16 laptop:w-14 laptop:h-14 phone:w-12 phone:h-12 object-cover rounded-full mb-2"
                />
                <Button>Upload Profile Picture</Button>
              </div>
            </Upload>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 tablet:grid-cols-2 w-full">
            <Input
              placeholder="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            />
            <Input
              placeholder="Age"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            />
            <Input
              placeholder="Phase"
              value={profile.phase}
              onChange={(e) => setProfile({ ...profile, phase: e.target.value })}
            />
            <Input
              placeholder="Block"
              value={profile.block}
              onChange={(e) => setProfile({ ...profile, block: e.target.value })}
            />
            <Input
              placeholder="Lot"
              value={profile.lot}
              onChange={(e) => setProfile({ ...profile, lot: e.target.value })}
            />
            <Select
              placeholder="Select Category"
              value={profile.category}
              onChange={(value) => setProfile({ ...profile, category: value })}
            >
              <Option value="Homeowner">Homeowner</Option>
              <Option value="Tenant">Tenant</Option>
            </Select>
          </div>

          <div className="flex justify-center my-5">
            <Button type="primary" onClick={handleSubmit} loading={loading} className="desktop:w-[21rem] phone:w-[16rem]">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
