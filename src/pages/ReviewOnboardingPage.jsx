import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import amihanaLogo from "../assets/images/amihana-logo.png";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { db, auth, storage } from "../firebases/FirebaseConfig";
import { Form, Input, Button, Spin, Avatar, Typography } from "antd";

const { Title, Text } = Typography;

const ReviewOnboardingPage = ({ account, setAccount, imagePreview }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const usersCollection = collection(db, "users");
  
      // Check if the email already exists
      const emailQuery = query(
        usersCollection,
        where("email", "==", account.email)
      );
      const emailSnapshot = await getDocs(emailQuery);
  
      if (!emailSnapshot.empty) {
        toast.error("This email is already in use.");
        setLoading(false);
        navigate("/signup");
        return;
      }
  
      const houseQuery = query(
        usersCollection,
        where("phase", "==", account.phase),
        where("block", "==", account.block),
        where("lot", "==", account.lot)
      );
      const houseSnapshot = await getDocs(houseQuery);
  
      if (!houseSnapshot.empty) {
        toast.error("There is already an account in this house no.");
        setLoading(false);
        navigate("/onboarding");
        return;
      }
  
      const nameQuery = query(usersCollection, where("fullName", "==", account.fullName));
      const nameSnapshot = await getDocs(nameQuery);
  
      if (!nameSnapshot.empty) {
        toast.error("This full name is already registered.");
        setLoading(false);
        navigate("/signup");
        return;
      }
  
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        account.email,
        account.password
      );
      const user = userCredential.user;
  
      let profilePictureUrl = "";
      if (account.profilePicture) {
        const profilePictureRef = ref(storage, `profilePictures/${user.uid}`);
        const uploadResult = await uploadBytes(
          profilePictureRef,
          account.profilePicture
        );
        profilePictureUrl = await getDownloadURL(uploadResult.ref);
      }
  
      const userDoc = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDoc);
  
      if (!docSnap.exists()) {
        await setDoc(userDoc, {
          email: account.email,
          fullName: account.fullName,
          phoneNumber: account.phoneNumber,
          age: account.age,
          phase: account.phase,
          block: account.block,
          lot: account.lot,
          profilePicture: profilePictureUrl,
          uid: user.uid,
          isAdmin: false,
          category: account.category,
          tenantAddress: account.tenantAddress,
        });
      } else {
        await updateDoc(userDoc, {
          fullName: account.fullName,
          phoneNumber: account.phoneNumber,
          age: account.age,
          phase: account.phase,
          block: account.block,
          lot: account.lot,
          profilePicture: profilePictureUrl,
          category: account.category,
          tenantAddress: account.tenantAddress,
        });
      }
  
      setAccount({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        age: "",
        profilePicture: null,
        uid: "",
        category: "",
        tenantAddress: "",
      });
  
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amihana-bg flex justify-center">
      <div className="min-h-screen desktop:w-[54rem] laptop:w-[44rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex justify-center items-center flex-col">
          <Avatar src={amihanaLogo} size={150} alt="Amihana logo" />
          <Form onSubmitCapture={handleSubmit} layout="vertical" className="flex flex-col items-center">
            <Title level={2} className="text-center">
              Let's review your details
            </Title>

            {loading ? (
              <Spin size="large" />
            ) : (
              <>
                <Form.Item label="Profile Picture">
                  <Avatar src={imagePreview} size={100} alt="Profile Preview" />
                </Form.Item>

                <div className="grid grid-cols-1 gap-4 mt-4 tablet:grid-cols-2">
                  <Form.Item label="Full Name">
                    <Text>{account.fullName}</Text>
                  </Form.Item>
                  <Form.Item label="Phone Number">
                    <Text>{account.phoneNumber}</Text>
                  </Form.Item>
                  <Form.Item label="Age">
                    <Text>{account.age}</Text>
                  </Form.Item>
                  <Form.Item label="Phase">
                    <Text>{account.phase}</Text>
                  </Form.Item>
                  <Form.Item label="Block">
                    <Text>{account.block}</Text>
                  </Form.Item>
                  <Form.Item label="Lot">
                    <Text>{account.lot}</Text>
                  </Form.Item>
                  <Form.Item label="Category">
                    <Text>{account.category}</Text>
                  </Form.Item>
                  {account.category === "Tenant" && (
                    <Form.Item label="Full Address">
                      <Text>{account.tenantAddress}</Text>
                    </Form.Item>
                  )}
                </div>

                <div className="flex w-full justify-between my-5">
                  <Button
                    onClick={() => navigate(-1)}
                    style={{ width: "7rem" }}
                  >
                    Back
                  </Button>

                  <Button type="primary" htmlType="submit" style={{ width: "7rem" }}>
                    Submit
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ReviewOnboardingPage;
