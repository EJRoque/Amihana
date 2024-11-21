import React, { useState } from "react";
import Papa from "papaparse"; // CSV parsing library
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../firebases/FirebaseConfig"; // Adjust path as needed
import { message, Upload, Button, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function UserManage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState({
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
  });

  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
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
    setAccount({
      ...account,
      email: "user@example.com", // Auto populate email
      password: "password123", // Auto populate password
      confirmPassword: "password123", // Auto populate confirm password
    });
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
        const { email, password, displayName } = row;

        // Validate required fields (email, password, and displayName)
        if (!email || !password || !displayName) {
          message.error("Missing required fields in CSV file.");
          continue;
        }

        try {
          // Create user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);

          // Extract the UID from Firebase Auth
          const { uid } = userCredential.user;

          // Add user data to Firestore
          await setDoc(doc(db, "users", uid), {
            email,
            uid, // Use the Firebase UID
            fullName: displayName,
            profilePicture: "", // Initialize empty profilePicture
            profileCompleted: false,
            createdAt: new Date().toISOString(),
          });

          message.success(`User ${displayName} uploaded successfully!`);
        } catch (error) {
          console.error("Error creating user:", error);
          message.error(`Failed to create user ${displayName}: ${error.message}`);
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

  // Handle manual user creation (for non-bulk)
  const handleCreateUser = async () => {
    const { email, password, confirmPassword } = account;

    // Validation: Ensure required fields are filled and passwords match
    if (!email || !password || !confirmPassword) {
      message.error("Please fill in email, password, and confirm password.");
      return;
    }
    if (password !== confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Extract the UID from the created user
      const { uid } = userCredential.user;

      // Default empty fields for Firestore document
      const userData = {
        email, // Required email field
        uid, // Firebase Authentication UID
        isAdmin: account.isAdmin || false, // Default to false unless specified
        fullName: "",
        phoneNumber: "",
        age: "",
        phase: "",
        block: "",
        lot: "",
        category: "",
        tenantAddress: "",
        profilePicture: "", // Initialize empty profilePicture
        profileCompleted: false, // New users will have profileCompleted set to false initially
        createdAt: new Date().toISOString(),
      };

      // Save the user data to Firestore, using `uid` as the document ID
      await setDoc(doc(db, "users", uid), userData);

      message.success("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("Failed to create user.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* CSV File Upload */}
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
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Create User</h2>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Email"
            value={account.email}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            value={account.password}
            onChange={(e) => setAccount({ ...account, password: e.target.value })}
            type={showPassword ? "text" : "password"} // Toggle between text and password
          />
          <Input
            placeholder="Confirm Password"
            value={account.confirmPassword}
            onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
            type={showPassword ? "text" : "password"}
          />
        </div>

        {/* Auto Populate Button */}
        <Button
          type="default"
          onClick={handleAutoPopulate}
          className="mt-4"
        >
          Auto Populate Email, Password, and Confirm Password
        </Button>

        {/* Show Password Button */}
        <Button
          type="default"
          onClick={() => setShowPassword((prevState) => !prevState)} // Toggle showPassword state
          className="mt-4"
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </Button>

        <Button
          type="primary"
          onClick={handleCreateUser}
          loading={loading}
          className="mt-4"
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </div>
  );
}
