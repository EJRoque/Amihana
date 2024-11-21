import React, { useState } from "react";
import Papa from "papaparse"; // CSV parsing library
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../firebases/FirebaseConfig"; // Adjust path as needed
import { message, Upload, Button, Input } from "antd";
import { UploadOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

export default function UserManage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([
    {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
      age: "",
      phase: "",
      block: "",
      lot: "",
      isAdmin: false,
      category: "",
      tenantAddress: "",
    },
  ]);

  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to manage confirm password visibility
  const auth = getAuth(); // Firebase Authentication instance

  // Handle file input change
  const handleFileChange = (info) => {
    if (info.file.status === "removed") {
      setFile(null);
      return;
    }
    const file = info.file.originFileObj;
    if (file) {
      setFile(file);
      message.success(`${file.name} selected successfully.`);
    }
  };

  // Handle "Auto Populate" button for email, password, and confirm password
  const handleAutoPopulate = () => {
    const updatedUsers = [...users];
    updatedUsers.forEach((user, index) => {
      updatedUsers[index] = {
        ...user,
        email: `user_${index}@example.com`, // Auto populate email with unique index
        password: "password123", // Auto populate password
        confirmPassword: "password123", // Auto populate confirm password
      };
    });
    setUsers(updatedUsers);
  };

  // Parse CSV file and create users in Firebase
  const handleUpload = async () => {
    if (!file) {
      message.error("Please upload a CSV file.");
      return;
    }
  
    setLoading(true);
    try {
      // Parse the CSV file
      const csvData = await parseCSV(file);
  
      // Validate and process each row
      for (const row of csvData) {
        const { email, password, confirmPassword, displayName } = row;
  
        // Validate required fields (email, password, and confirmPassword)
        if (!email || !password || !confirmPassword) {
          message.error("Missing required fields in CSV file.");
          continue;
        }
  
        // Ensure passwords match
        if (password !== confirmPassword) {
          message.error(`Passwords do not match for ${email}.`);
          continue;
        }
  
        try {
          // Create user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
          // Extract the UID from Firebase Auth
          const { uid } = userCredential.user;
  
          // Use a fallback value for displayName if it's missing
          const userDisplayName = displayName || "No Name Provided";
  
          // Add user data to Firestore
          await setDoc(doc(db, "users", uid), {
            email,
            uid, // Use the Firebase UID
            fullName: userDisplayName, // Use the displayName or fallback value
            profilePicture: "", // Initialize empty profilePicture
            profileCompleted: false,
            createdAt: new Date().toISOString(),
          });
  
          message.success(`User ${userDisplayName} uploaded successfully!`);
        } catch (error) {
          console.error("Error creating user:", error);
          message.error(`Failed to create user ${displayName || email}: ${error.message}`);
        }
      }
  
      message.success("All users uploaded successfully!");
    } catch (error) {
      console.error("Error uploading users:", error);
      message.error("Failed to upload users.");
    } finally {
      setLoading(false);
    }
  };  

  // Handle bulk user creation (from manual form)
  const handleCreateUsers = async () => {
    setLoading(true);

    for (const user of users) {
      const { email, password, confirmPassword } = user;

      // Validation: Ensure required fields are filled and passwords match
      if (!email || !password || !confirmPassword) {
        message.error("Please fill in email, password, and confirm password.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        message.error("Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Extract the UID from the created user
        const { uid } = userCredential.user;

        // Default empty fields for Firestore document
        const userData = {
          email, // Required email field
          uid, // Firebase Authentication UID
          isAdmin: user.isAdmin || false, // Default to false unless specified
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          age: user.age,
          phase: user.phase,
          block: user.block,
          lot: user.lot,
          category: user.category,
          tenantAddress: user.tenantAddress,
          profilePicture: "", // Initialize empty profilePicture
          profileCompleted: false, // New users will have profileCompleted set to false initially
          createdAt: new Date().toISOString(),
        };

        // Save the user data to Firestore, using `uid` as the document ID
        await setDoc(doc(db, "users", uid), userData);

        message.success(`User ${email} created successfully!`);
      } catch (error) {
        console.error("Error creating user:", error);
        message.error(`Failed to create user ${email}: ${error.message}`);
      }
    }

    setLoading(false);
    message.success("All users created successfully!");
  };

  // Helper: Parse CSV file
  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  };

  // Handle adding new user form
  const addNewUserForm = () => {
    setUsers([
      ...users,
      {
        email: `user_${users.length}@example.com`, // Ensure the new user email is unique
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        age: "",
        phase: "",
        block: "",
        lot: "",
        isAdmin: false,
        category: "",
        tenantAddress: "",
      },
    ]);
  };

  return (
    <div className="bg-white w-full flex flex-col justify-start" style={{ textAlign: 'start', padding: '20px' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ marginTop: 0 }}>
        User Management
      </h1>
      <p className="p-6">
        The User Management feature allows administrators to efficiently create and manage user accounts. 
        You can either manually create individual accounts by entering user details or upload a CSV file to bulk create multiple users at once. 
        This system ensures seamless integration with Firebase Authentication for user registration and Firestore for storing user data. 
        The user information is securely stored, and additional fields can be updated as needed. This feature is designed to simplify user management, 
        making it ideal for both small and large-scale user registrations.
      </p>
      <div className="p-6">
        <h2 className="text-xl font-semibold">Upload CSV file</h2>
        <div className="space-y-4">
          <Upload
            beforeUpload={() => false} // Prevent default upload behavior
            onChange={handleFileChange}
            onRemove={() => setFile(null)}
            maxCount={1} // Allow only one file
            accept=".csv"
          >
            <Button icon={<UploadOutlined />}>Select CSV File</Button>
          </Upload>

          <Button
            type="primary"
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
          >
            {loading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>

        {/* Manual User Creation Form */}
        <div className="mt-[10vh]">
          <h2 className="text-xl font-semibold">Create Users</h2>

          {/* Buttons: Generate, Add New User, Create Users */}
          <div className="flex space-x-4 mb-4">
            <Button
              type="default"
              onClick={handleAutoPopulate}
              className="mt-4"
            >
              Generate
            </Button>
            <Button
              type="default"
              onClick={addNewUserForm}
              className="mt-4"
            >
              Add Another User
            </Button>
            <Button
              type="primary"
              onClick={handleCreateUsers}
              loading={loading}
              className="mt-4"
              style={{ background: "#0C82B4", color: "#FFFFFF" }}
            >
              {loading ? "Creating..." : "Create Users"}
            </Button>
          </div>

          {/* Input Fields */}
          {users.map((user, index) => (
            <div key={index} className="space-y-4 mt-4">
              <Input
                placeholder="Email"
                value={user.email}
                onChange={(e) => {
                  const updatedUsers = [...users];
                  updatedUsers[index].email = e.target.value;
                  setUsers(updatedUsers);
                }}
              />
              <Input
                placeholder="Password"
                value={user.password}
                onChange={(e) => {
                  const updatedUsers = [...users];
                  updatedUsers[index].password = e.target.value;
                  setUsers(updatedUsers);
                }}
                type={showPassword ? "text" : "password"}
                suffix={
                  showPassword ? (
                    <EyeOutlined onClick={() => setShowPassword(false)} />
                  ) : (
                    <EyeInvisibleOutlined onClick={() => setShowPassword(true)} />
                  )
                }
              />
              <Input
                placeholder="Confirm Password"
                value={user.confirmPassword}
                onChange={(e) => {
                  const updatedUsers = [...users];
                  updatedUsers[index].confirmPassword = e.target.value;
                  setUsers(updatedUsers);
                }}
                type={showConfirmPassword ? "text" : "password"}
                suffix={
                  showConfirmPassword ? (
                    <EyeOutlined onClick={() => setShowConfirmPassword(false)} />
                  ) : (
                    <EyeInvisibleOutlined onClick={() => setShowConfirmPassword(true)} />
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
