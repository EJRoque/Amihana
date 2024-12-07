import React, { useState , useEffect} from "react";
import Papa from "papaparse"; // CSV parsing library
import { getDocs, collection, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../firebases/FirebaseConfig"; // Adjust path as needed
import {
  message,
  Upload,
  Button,
  Input,
  Progress,
  notification,
  Card,
  Typography,
  Tooltip,
  Select,
  Table,
  Modal,
} from "antd";
import { 
  UploadOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  SearchOutlined , 
  FilterOutlined 
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function UserManage() {
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newUsers, setNewUsers] = useState([
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const auth = getAuth();

  // CSV Validation
  const validateCSV = (data) => {
    const requiredHeaders = ["email", "password", "fullName", "phoneNumber"];
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

    if (missingHeaders.length > 0) {
      message.error(`Missing required columns: ${missingHeaders.join(", ")}`);
      return false;
    }

    return true;
  };
    // Fetch users from Firestore
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const usersCollection = collection(db, "users");
          const snapshot = await getDocs(usersCollection);
          const usersList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersList);
          console.log("Fetched users:", usersList);
        } catch (error) {
          console.error("Error fetching users:", error.message);
          message.error("Failed to fetch users from Firebase.");
        }
      };
    
      fetchUsers();
    }, []);
    

  // Handle file input change
  const handleFileChange = (info) => {
    if (info.file.status === "removed") {
      setFile(null);
      return;
    }

    const file = info.file.originFileObj;
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (validateCSV(results.data)) {
            setFile(file);
            message.success(`${file.name} is ready to upload.`);
          }
        },
        error: () => {
          message.error("Failed to parse CSV file. Please check the format.");
        },
      });
    }
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button danger onClick={() => confirmDeleteUser(record)}>
          Delete
        </Button>
      ),
    },
  ];
  

  const tableData = searchText ? filteredUsers : users;

  // Bulk user creation function
  const createUsers = async () => {
    setLoading(true);
    for (let i = 0; i < newUsers.length; i++) {
      try {
        const user = newUsers[i];
        const { email, password, confirmPassword } = user;
  
        if (!email || !password || password !== confirmPassword) {
          throw new Error("Invalid data. Ensure email and matching passwords.");
        }
  
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
  
        await setDoc(doc(db, "users", uid), {
          ...user,
          uid,
          createdAt: new Date().toISOString(),
          profilePicture: "",
          profileCompleted: false,
        });
  
        setProgress(Math.round(((i + 1) / newUsers.length) * 100));
      } catch (error) {
        notification.error({
          message: "User Creation Failed",
          description: error.message,
        });
      }
    }
  
    setLoading(false);
    setProgress(0);
    notification.success({
      message: "Users Created",
      description: "All users have been successfully created.",
    });
    resetUserForms(); // Clear forms after creating users
  };

  const userTemplate = {
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
  };

  const addNewUserForm = () => {
    setNewUsers([...newUsers, { ...userTemplate }]);
  };

  const resetUserForms = () => {
    setNewUsers([{ ...userTemplate }]);
  };

  const handleSubmitCSV = async () => {
    if (!file) {
      message.error("No file uploaded!");
      return;
    }

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const validUsers = results.data;
          if (!validateCSV(validUsers)) return;

          for (let i = 0; i < validUsers.length; i++) {
            const user = validUsers[i];
            const { email, password } = user;

            if (!email || !password) {
              throw new Error("Invalid data in the CSV.");
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, "users", uid), {
              ...user,
              uid,
              createdAt: new Date().toISOString(),
              profilePicture: "",
              profileCompleted: false,
            });

            setProgress(Math.round(((i + 1) / validUsers.length) * 100));
          }

          message.success("CSV upload successful!");
        } catch (error) {
          message.error(`Error processing CSV: ${error.message}`);
        } finally {
          setLoading(false);
          setProgress(0);
        }
      },
    });
  };

  const handleAutoPopulate = () => {
    const updatedUsers = [...newUsers];
    updatedUsers.forEach((user, index) => {
      updatedUsers[index] = {
        ...user,
        email: `user_${index + 1}@example.com`, // Auto populate email with unique index
        password: "password123", // Auto populate password
        confirmPassword: "password123", // Auto populate confirm password
      };
    });
    setNewUsers(updatedUsers); // Update the newUsers state
  };
  

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(value) || user.fullName.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };


  const showPreviewModal = () => {
    setPreviewModalVisible(true);
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user); // Store the user to delete
    setDeleteModalVisible(true); // Show the modal
  };
  

  const handleDeleteConfirmed = () => {
    if (userToDelete) {
      const updatedUsers = users.filter((user) => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      message.success("User deleted successfully.");
      setDeleteModalVisible(false); // Hide the modal
      setUserToDelete(null); // Clear the selected user
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteModalVisible(false); // Hide the modal
    setUserToDelete(null); // Clear the selected user
  };
  

  return (
<div className="bg-white w-full flex flex-col px-4 md:px-6 lg:px-8 py-6">
  <h1 className="text-2xl font-bold mb-6 text-start sm:text-left ">
    User Management
  </h1>

{/* Main Content */}
<div className="flex flex-wrap lg:flex-nowrap gap-6">
  {/* Create Users Section */}
  <Card
    title="Create Users"
    className="w-full lg:w-1/2 shadow-sm"
    style={{ flex: 1 }}
  >
    {/* Form Inputs */}
    {newUsers.map((user, index) => (
      <div key={index} className="space-y-2">
        <Input
          placeholder="Email"
          value={user.email}
          onChange={(e) => {
            const updatedNewUsers = [...newUsers];
            updatedNewUsers[index].email = e.target.value;
            setNewUsers(updatedNewUsers);
          }}
          className="mt-6"
        />
        <Input
          placeholder="Password"
          value={user.password}
          onChange={(e) => {
            const updatedNewUsers = [...newUsers];
            updatedNewUsers[index].password = e.target.value;
            setNewUsers(updatedNewUsers);
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
            const updatedNewUsers = [...newUsers];
            updatedNewUsers[index].confirmPassword = e.target.value;
            setNewUsers(updatedNewUsers);
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
    {/* Buttons */}
    <div className="flex flex-row justify-between mt-4 ">
      <div className="flex flex-col space-y-2">
        <Button type="default" onClick={addNewUserForm}>
          Add Another User
        </Button>
        <Button
          type="primary"
          loading={loading}
          style={{ background: "#0C82B4", color: "#FFFFFF" }}
          onClick={createUsers}
        >
          {loading ? `Creating... (${progress}%)` : "Create Users"}
        </Button>
        </div>
        <div className="space-x-4">
        <Button danger onClick={resetUserForms}>
          Reset Forms
        </Button>
        <Button
          type="default"
          style={{ backgroundColor: "#0C82B4", color: "#fff" }}
          onClick={handleAutoPopulate}
        >
          Generate Accounts
        </Button>
      </div>
      
    </div>
    {loading && <Progress percent={progress} />}
    <div className="mt-4">
      <Paragraph>
          Upload a CSV with columns: email, password, fullName, and phoneNumber.
      </Paragraph>
    </div>
  </Card>

  {/* Upload CSV Section */}
  <Card
    title="Upload CSV File"
    className="w-full lg:w-1/2 shadow-sm"
    style={{ flex: 1 }}
  >
    <Upload
      beforeUpload={() => false}
      onChange={handleFileChange}
      onRemove={() => setFile(null)}
      maxCount={1}
    >
      <Button icon={<UploadOutlined />}>Upload CSV</Button>
    </Upload>
    <Button
      type="primary"
      onClick={handleSubmitCSV}
      loading={loading}
      style={{ marginTop: "20px" }}
    >
      {loading ? `Uploading... (${progress}%)` : "Upload CSV"}
    </Button>
    <div className="mt-2 text-sm text-gray-500">
      <Paragraph>
        Upload a CSV with columns: email, password, fullName, and phoneNumber.
      </Paragraph>
    </div>
  </Card>
</div>


  {/* Search and Table */}
  <Input
    placeholder="Search by email or name"
    value={searchText}
    onChange={handleSearch}
    className="my-6 max-w-lg lg:mx-0"
    prefix={<SearchOutlined />}
  />
  <Card title="Current Users" className="shadow-sm">
    <Table
      dataSource={tableData}
      columns={columns}
      pagination={{
        pageSize: 5,
        style: { position: "flex", justifyContent: "center" },
      }}
      rowKey="email"
    />
  </Card>
</div>

  );
}
