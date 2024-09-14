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
        alert("This email is already in use.");
        setLoading(false);
        navigate("/signup"); // Redirect back to signup page
        return;
      }

      // Check if the block, phase, and lot already exist
      const houseQuery = query(
        usersCollection,
        where("phase", "==", account.phase),
        where("block", "==", account.block),
        where("lot", "==", account.lot)
      );
      const houseSnapshot = await getDocs(houseQuery);

      if (!houseSnapshot.empty) {
        alert("There is already an account in this house no.");
        setLoading(false);
        navigate("/onboarding"); // Redirect to the onboarding page
        return;
      }

      // Proceed with account creation
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        account.email,
        account.password
      );
      const user = userCredential.user;

      // Upload profile picture to Firebase Storage
      let profilePictureUrl = "";
      if (account.profilePicture) {
        const profilePictureRef = ref(storage, `profilePictures/${user.uid}`);
        const uploadResult = await uploadBytes(
          profilePictureRef,
          account.profilePicture
        );
        profilePictureUrl = await getDownloadURL(uploadResult.ref);
      }

      // Save user information to Firestore
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
          category: account.category, // Add category
          tenantAddress: account.tenantAddress, // Add fullAddress
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
          category: account.category, // Update category
          tenantAddress: account.tenantAddress, // Update fullAddress
        });
      }

      console.log("Document successfully updated!");

      // Clear account state after submission
      setAccount({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        age: "",
        profilePicture: null,
        uid: "",
        category: "", // Clear category
        tenantAddress: "", // Clear fullAddress
      });

      toast.success("Account created successfully!"); // Show success toast

      navigate("/"); // Adjust the path accordingly
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again."); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amihana-bg flex justify-center">
      <div className="min-h-screen desktop:w-[34rem] laptop:w-[34rem] phone:w-full bg-[#E9F5FE] flex justify-center items-center flex-col">
        <div className="flex justify-center items-center flex-col">
          <div className="flex desktop:w-[18rem] laptop:w-[14rem] phone:w-[12rem] mb-1">
            <img src={amihanaLogo} alt="Amihana logo" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <h1 className="text-center desktop:text-2xl laptop:text-xl phone:text-xl font-semibold mb-2">
              Let's review your details
            </h1>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <label
                  htmlFor="profilePicture"
                  className="text-center desktop:text-xl laptop:text-lg phone:text-lg mb-2"
                >
                  Profile picture
                </label>
                <div className="flex justify-center items-center mb-4">
                  <div className="h-[6rem] w-[6rem] flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="desktop:w-16 desktop:h-16 laptop:w-14 laptop:h-14 phone:w-12 phone:h-12 object-cover rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4 tablet:grid-cols-2">
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mb-1 ml-1">
                      Full name
                    </label>
                    <div className="h-[2.5rem] desktop:w-[13.5rem] laptop:w-[13.5rem] phone:w-[16rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.fullName}</p>
                    </div>
                  </div>
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                      Phone number
                    </label>
                    <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.phoneNumber}</p>
                    </div>
                  </div>
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                      Age
                    </label>
                    <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.age}</p>
                    </div>
                  </div>
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                      Phase
                    </label>
                    <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.phase}</p>
                    </div>
                  </div>
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                      Block
                    </label>
                    <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.block}</p>
                    </div>
                  </div>
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                      Lot
                    </label>
                    <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.lot}</p>
                    </div>
                  </div>
                  <div>
                    <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                      Category
                    </label>
                    <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                      <p className="ml-4 my-auto">{account.category}</p>
                    </div>
                  </div>
                  {account.category === "Tenant" && (
                    <div>
                      <label className="desktop:text-xl laptop:text-xl phone:text-lg mt-3 mb-1 ml-1">
                        Full Address
                      </label>
                      <div className="h-[2.5rem] bg-white border-2 border-solid border-gray-400 rounded-md flex items-center">
                        <p className="ml-4 my-auto text-[0.65rem]">
                          {account.tenantAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex w-full justify-between my-5">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="h-[2.5rem] desktop:w-[7rem] laptop:w-[7rem] phone:w-[5rem] bg-white rounded-md text-[#0C82B4] border-2 border-solid border-gray-400"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="h-[2.5rem] desktop:w-[7rem] laptop:w-[7rem] phone:w-[5rem] bg-[#0C82B4] rounded-md text-white"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewOnboardingPage;
