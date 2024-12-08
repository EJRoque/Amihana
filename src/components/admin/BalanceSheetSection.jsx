import React, { useState, useEffect } from "react";
import { FaTrash,FaClipboardList } from "react-icons/fa";
import Modal from "./Modal";
import { db, auth } from "../../firebases/FirebaseConfig";
import {doc,setDoc,getDoc,updateDoc,deleteField,onSnapshot,addDoc, collection, serverTimestamp,query,getDocs,orderBy,limit} from "firebase/firestore";
import { Button, notification, AutoComplete,Transfer,Modal as AntModal,Typography, Divider, Space, Tag, Card, List, Steps, Alert,Input } from "antd"; // Import Button from Ant Design
import { ClipLoader } from "react-spinners"; // Import the spinner
import { DollarOutlined, TeamOutlined,PrinterOutlined,QuestionCircleOutlined,DashboardOutlined, SearchOutlined, EditOutlined, UserAddOutlined,ToolOutlined,AuditOutlined,WarningOutlined } from '@ant-design/icons';
import { FaMoneyBillWave } from "react-icons/fa"; // New import for money icon
import { signInWithEmailAndPassword } from "firebase/auth";
const { Title, Paragraph, Text } = Typography;

const BalanceSheetSection = ({ selectedYear, setData}) => {
  const [data, setDataState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userInputs, setUserInputs] = useState([""]);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [hoaMembershipAmount, setHoaMembershipAmount] = useState(0);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [initialAmounts, setInitialAmounts] = useState({}); //
  const [totalMonthPaid, setTotalMonthPaid] = useState(0); // State for total month paid
  const [totalHoaMembershipPaid, setTotalHoaMembershipPaid] = useState(0); // State for total HOA paid
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [validUsers, setValidUsers] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditTrails, setAuditTrails] = useState([]);
  const [currentAdminName, setCurrentAdminName] = useState("Unknown Admin");
  const [selectedCells, setSelectedCells] = useState([]);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Hoa"];
  const [amounts, setAmounts] = useState({Jan: 0, Feb: 0,Mar: 0, Apr: 0,May: 0,Jun: 0,Jul: 0,Aug: 0,Sep: 0,Oct: 0,Nov: 0,Dec: 0,});
  const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingChanges, setPendingChanges] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  // Function to calculate totals and update Firestore
const calculateTotals = async () => {
  let monthTotal = 0;
  let hoaTotal = 0;
  Object.values(data).forEach((user) => {
    // Sum all paid monthly amounts
    monthTotal += monthsOrder.reduce((sum, month) => {
      return sum + (user[month]?.paid ? user[month]?.amount || 0 : 0);
    }, 0);
    // Sum HOA membership if paid
    if (user["Hoa"]?.paid) {
      hoaTotal += user["Hoa"].amount || 0;
    }
  });
  // Update state with calculated totals
  setTotalMonthPaid(monthTotal);
  setTotalHoaMembershipPaid(hoaTotal);
  // Save totals to Firestore
  try {
    const balanceSheetDocRef = doc(db, "balanceSheetRecord", selectedYear);

    await updateDoc(balanceSheetDocRef, {
      totalMonthPaid: monthTotal,
      totalHoaMembershipPaid: hoaTotal,
    });

    console.log("Totals saved successfully to Firestore");
  } catch (error) {
    console.error("Error saving totals to Firestore:", error);
  }
};

  // Recalculate totals whenever data changes
  useEffect(() => {
    calculateTotals();
  }, [data]);

  const handleOpenGuideModal = () => {
    setIsGuideModalOpen(true);
  };


  // Add new useEffect to fetch admin's full name when component mounts
  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentAdminName(userData.fullName || "Unknown Admin");
          }
        }
      } catch (error) {
        console.error("Error fetching admin name:", error);
        setCurrentAdminName("Unknown Admin");
      }
    };

    fetchAdminName();
  }, []);

/// Update handleAmountChange to compare current values with initial values
const handleAmountChange = (month, value) => {
  const updatedAmounts = {
    ...amounts,
    [month]: parseFloat(value) || 0,
  };
  setAmounts(updatedAmounts);

  // Check for changes after update
  checkIfAmountsChanged(updatedAmounts, hoaMembershipAmount);
};

const handleHoaMembershipChange = (value) => {
  const updatedHoaAmount = parseFloat(value) || 0;
  setHoaMembershipAmount(updatedHoaAmount);

  // Check for changes after update
  checkIfAmountsChanged(amounts, updatedHoaAmount);
};


 
  // Save Monthly and HOA Membership Amounts to Firestore
   // Save Monthly and HOA Membership Amounts to Firestore
   const saveMonthlyAmounts = async () => {
    if (!selectedYear) {
      notification.warning({ message: "Please select a year first!" });
      return;
    }
  
    try {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
  
      // Map of full month names
      const monthNames = {
        Jan: "January",
        Feb: "February",
        Mar: "March",
        Apr: "April",
        May: "May",
        Jun: "June",
        Jul: "July",
        Aug: "August",
        Sep: "September",
        Oct: "October",
        Nov: "November",
        Dec: "December",
      };
  
      // Identify months that changed
      const changedAmounts = {};
      for (const month in amounts) {
        if (amounts[month] !== initialAmounts[month]) {
          changedAmounts[month] = amounts[month];
        }
      }
  
      // Check if the HOA amount has changed
      let hoaChanged = false;
      if (hoaMembershipAmount !== initialAmounts.hoaMembershipAmount) {
        changedAmounts["hoaMembershipAmount"] = hoaMembershipAmount;
        hoaChanged = true;
      }
  
      if (Object.keys(changedAmounts).length > 0) {
        await setDoc(
          yearDocRef,
          {
            monthlyAmounts: { ...initialAmounts, ...changedAmounts },
            hoaMembershipAmount,
          },
          { merge: true }
        );
  
        // Create grouped notifications for monthly amounts
        const changedMonths = Object.entries(changedAmounts).map(([month, amount]) => ({
          month: monthNames[month] || month, // Use full name if available
          amount,
        }));
  
        const groupedByAmount = changedMonths.reduce((acc, curr) => {
          if (curr.month === "hoaMembershipAmount") return acc; // Skip HOA for now
          if (!acc[curr.amount]) {
            acc[curr.amount] = [];
          }
          acc[curr.amount].push(curr.month);
          return acc;
        }, {});
  
        for (const [amount, months] of Object.entries(groupedByAmount)) {
          if (months.length > 1) {
            await postNotification(`The amount for the months of ${months.join(", ")} is changed to ₱ ${amount} for the year ${selectedYear}`);
          } else {
            await postNotification(`The amount for the month of ${months[0]} is changed to ₱ ${amount} for the year ${selectedYear}`);
          }
        }
  
        // Create a specific notification for the HOA membership fee
        if (hoaChanged) {
          await postNotification(`The amount for the HOA membership is changed to ₱ ${hoaMembershipAmount} for the year ${selectedYear}`);
        }
  
        setInitialAmounts({ ...initialAmounts, ...changedAmounts, hoaMembershipAmount });
        setIsButtonActive(false);
        notification.success({ message: "Monthly and HOA amounts saved successfully!" });
      }
    } catch (error) {
      console.error("Error saving amounts:", error);
      notification.error({ message: "Error saving amounts" });
    }
  };
  
  
  
  

const postNotification = async (message, status = "info") => {
  try {
    await addDoc(collection(db, "notifications"), {
      message,
      status,
      timestamp: serverTimestamp(),
      createdAt: new Date(), // Optional for older formats
    });
    console.log("Notification posted successfully");
  } catch (error) {
    console.error("Error posting notification:", error);
  }
};

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseAdjustModal = () => setIsAdjustModalOpen(false);
  const handleOpenAdjustModal = () => {
    console.log("working")
    setIsAdjustModalOpen(true)};

  useEffect(() => {
    if (setData) {
      setData(data); // Pass the data to the parent component
    }
  }, [data, setData]);
  
  // Set initial state when fetching year data
useEffect(() => {
  if (selectedYear) {
    const fetchYearData = async () => {
      // Fetch data code remains the same...
      setInitialAmounts({ ...orderedMonthlyAmounts, hoaMembershipAmount });
    };

    fetchYearData();
  }
}, [selectedYear]);

  // Real-time listener for document changes
  useEffect(() => {
    if (selectedYear) {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);

      const unsubscribe = onSnapshot(yearDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const yearData = docSnapshot.data();
          setDataState(yearData.Name || {}); // Update the component state with the latest data
        } else {
          setDataState({});
        }
      });

      return () => unsubscribe(); // Cleanup the listener on unmount or when selectedYear changes
    }
  }, [selectedYear]);

// Fetch data for the selected year and set amounts
useEffect(() => {
  if (selectedYear) {
    const fetchYearData = async () => {
      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        const docSnapshot = await getDoc(yearDocRef);
        if (docSnapshot.exists()) {
          const yearData = docSnapshot.data();
          const orderedMonthlyAmounts = monthsOrder.reduce((acc, month) => {
            acc[month] = yearData.monthlyAmounts?.[month] || 0;
            return acc;
          }, {});
          setAmounts(orderedMonthlyAmounts);
          setHoaMembershipAmount(yearData.hoaMembershipAmount || 0);
          setInitialAmounts({ ...orderedMonthlyAmounts, hoaMembershipAmount: yearData.hoaMembershipAmount || 0 });
        }
      } catch (error) {
        console.error("Error fetching year data:", error);
      }
    };

    fetchYearData();
  }
}, [selectedYear]);



const togglePaidStatus = async (name, month) => {
  console.log('------- Toggle Paid Status Detailed Debug -------');
  console.log('Name:', name);
  console.log('Month:', month);
  console.log('Is Edit Mode:', isEditMode);
  
  if (!isEditMode) return;

  const cellKey = `${name}-${month}`;

  // Update selected cells
  setSelectedCells(prev => {
    const newSelectedCells = prev.includes(cellKey) 
      ? prev.filter(cell => cell !== cellKey)
      : [...prev, cellKey];
    
    console.log('Updated Selected Cells:', newSelectedCells);
    return newSelectedCells;
  });

  try {
    // Deep clone the current data to avoid direct mutation
    const updatedData = JSON.parse(JSON.stringify(data));
    
    // Ensure the user and month exist in the data structure
    if (!updatedData[name]) {
      updatedData[name] = {};
    }

    // Get current month data, default to empty object if not exists
    const currentMonthData = updatedData[name][month] || { paid: false, amount: 0 };
    
    // Toggle paid status
    const newPaidStatus = !currentMonthData.paid;
    
    // Determine the amount based on the current amounts state
    const updatedAmount = month === "Hoa" 
      ? (newPaidStatus ? hoaMembershipAmount : 0)
      : (newPaidStatus ? (amounts[month] || 0) : 0);

    // Update the specific month's data
    updatedData[name][month] = {
      paid: newPaidStatus,
      amount: updatedAmount
    };

    console.log('Current Month Data:', currentMonthData);
    console.log('New Paid Status:', newPaidStatus);
    console.log('Updated Amount:', updatedAmount);
    console.log('Full Updated Data:', updatedData);

    // Update the state with the new data
    setDataState(updatedData);

    // Optional: Log audit trail
    logAuditTrail(name, month, newPaidStatus);

    console.log('------- End of Toggle Paid Status Debug -------');
  } catch (error) {
    console.error('Error in togglePaidStatus:', error);
    notification.error({ message: 'Failed to update paid status' });
  }
};

useEffect(() => {
  const syncDataToFirestore = async () => {
    if (selectedYear && Object.keys(data).length > 0) {
      try {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        await updateDoc(yearDocRef, { Name: data });
        console.log('Data synced to Firestore successfully');
      } catch (error) {
        console.error('Error syncing data to Firestore:', error);
        notification.error({ message: 'Failed to sync data' });
      }
    }
  };

  syncDataToFirestore();
}, [data, selectedYear]);

const applyBulkStatusUpdate = async () => {
  if (!isEditMode || selectedCells.length === 0) return;

  const updatePromises = selectedCells.map(cellKey => {
    const [name, month] = cellKey.split('-');
    const newPaidStatus = true; // Always setting to paid for bulk update
    
    const updatedAmount = month === "Hoa" 
      ? hoaMembershipAmount 
      : (amounts[month] || 0);

    // Update local state
    setDataState(prevData => ({
      ...prevData,
      [name]: {
        ...prevData[name],
        [month]: {
          paid: newPaidStatus,
          amount: updatedAmount,
        }
      }
    }));
  });
};

// Fetch Audit Trails
// In the fetchAuditTrails function, modify the mapping:
const fetchAuditTrails = async () => {
  try {
    const auditTrailsRef = collection(db, "auditTrails");
    const q = query(
      auditTrailsRef, 
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const trails = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().formattedTimestamp || 
                   doc.data().timestamp?.toDate()?.toLocaleString() || 
                   'Unknown Date'
      }))
      .filter(trail => trail.year === selectedYear);
    setAuditTrails(trails);
  } catch (error) {
    console.error("Error fetching audit trails:", error);
  }
};

const handleOpenAuditModal = () => {
  fetchAuditTrails();
  setIsAuditModalOpen(true);
};
  

  const handleDeleteUser = async (name) => {
    if (!selectedYear) return;
  
    // Show a confirmation prompt
    const isConfirmed = window.confirm(`Are you sure you want to delete ${name}?`);
  
    if (!isConfirmed) return; // Exit the function if the user cancels
  
    // Proceed with deletion
    setDataState((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[name];
      return updatedData;
    });
  
    try {
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
      await updateDoc(yearDocRef, {
        [`Name.${name}`]: deleteField(),
      });
  
      notification.success({
        message: `${name} has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
      notification.error({
        message: `Error deleting ${name}. Please try again.`,
      });
    }
  };
  

  const handleInputChange = (value, index) => {
    setUserInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = value;
      return updatedInputs;
    });
  };

  const handleRemoveUserInput = (index) => {
    setUserInputs((prevInputs) => {
      const updatedInputs = prevInputs.filter((_, i) => i !== index);
      return updatedInputs;
    });
  };

  // Filter data based on search term
  const filteredData = Object.entries(data).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle adding a new user
 // Modify handleAddUser to validate users
 // Modified handleAddUser method
 const handleAddUser = async () => {
  if (!selectedYear) {
    notification.warning({ message: "Please select a year first!" });
    return;
  }

  try {
    setIsLoading(true);
    const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
    const newUserData = {};

    targetKeys.forEach((name) => {
      newUserData[`Name.${name}`] = {
        Hoa: { paid: false, amount: 0 },
        Jan: { paid: false, amount: 0 },
        Feb: { paid: false, amount: 0 },
        Mar: { paid: false, amount: 0 },
        Apr: { paid: false, amount: 0 },
        May: { paid: false, amount: 0 },
        Jun: { paid: false, amount: 0 },
        Jul: { paid: false, amount: 0 },
        Aug: { paid: false, amount: 0 },
        Sep: { paid: false, amount: 0 },
        Oct: { paid: false, amount: 0 },
        Nov: { paid: false, amount: 0 },
        Dec: { paid: false, amount: 0 },
      };
    });

    await updateDoc(yearDocRef, newUserData);

    notification.success({ message: "New user(s) added successfully!" });
    setTargetKeys([]); // Reset selected users
    setIsModalOpen(false); // Close modal
  } catch (error) {
    console.error("Error adding user:", error);
    notification.error({ message: "Error adding user" });
  } finally {
    setIsLoading(false);
  }
};


const checkIfAmountsChanged = (newAmounts, newHoaAmount) => {
  const isChanged =
    JSON.stringify(newAmounts) !== JSON.stringify(initialAmounts) ||
    newHoaAmount !== initialAmounts.hoaMembershipAmount;
  setIsButtonActive(isEditMode && isChanged);
};

// Fetch users from Firestore
// Fetch existing users in the table and available users from Firestore
useEffect(() => {
  const fetchUsers = async () => {
    try {
      // Fetch all users from users collection
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      // Get existing users from current data
      const existingUsers = Object.keys(data || {});

      // Create user list excluding existing users and admin users
      const availableUsers = usersSnapshot.docs
        .filter(doc => !doc.data().isAdmin) // Add this line to exclude admin users
        .map(doc => ({
          key: doc.data().fullName,
          title: doc.data().fullName
        }))
        .filter(user => !existingUsers.includes(user.key));

      setUserSuggestions(availableUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  if (data) {
    fetchUsers();
  }
}, [data]);

 // Handle Transfer component changes
 const handleTransferChange = (newTargetKeys) => {
  setTargetKeys(newTargetKeys);
};

// New function to log audit trail
const logAuditTrail = async (name, month, newPaidStatus) => {
  try {
    await addDoc(collection(db, "auditTrails"), {
      adminName: currentAdminName, // Use the fetched admin name
      userName: name,
      month: month,
      status: newPaidStatus ? "Paid" : "Unpaid",
      timestamp: new Date(),
      formattedTimestamp: new Date().toLocaleString(),
      year: selectedYear || new Date().getFullYear()
    });
  } catch (error) {
    console.error("Error logging audit trail:", error);
    notification.error({
      message: "Failed to log audit trail",
      description: error.message
    });
  }
};

const handlePrintAuditTrail = () => {
  // Create a new window for printing
  const printWindow = window.open('', '', 'height=500, width=800');
  
  // Start HTML document
  printWindow.document.write(`
    <html>
      <head>
        <title>Audit Trail Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
          }
          h1 { 
            text-align: center; 
            color: #333; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
          }
          .print-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Audit Trail Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Admin</th>
              <th>User</th>
              <th>Month</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${auditTrails.map(trail => `
              <tr>
                <td>${trail.adminName}</td>
                <td>${trail.userName}</td>
                <td>${trail.month}</td>
                <td style="color: ${trail.status === 'Paid' ? 'green' : 'red'}">${trail.status}</td>
                <td>${trail.timestamp}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="print-footer">
          <p>Report generated from Balance Sheet System</p>
        </div>
      </body>
    </html>
  `);

  // Close the document writing
  printWindow.document.close();

  // Trigger print dialog
  printWindow.print();
};

// Modify the existing save methods to use password verification
const saveChangesWithVerification = () => {
  // Store original data for potential rollback (before any changes are made)
  setOriginalData({
    originalData: JSON.parse(JSON.stringify(data)),
    originalAmounts: {...amounts},
    originalHoaMembershipAmount: hoaMembershipAmount,
    originalSelectedCells: [...selectedCells]
  });

  // Store current changes
  setPendingChanges({
    data,
    amounts,
    hoaMembershipAmount,
    selectedCells,
  });

  // Open password verification modal
  setIsPasswordModalVisible(true);
};

const handlePasswordVerification = async () => {
  try {
    // Get current user's email
    const currentUser = auth.currentUser;
    if (!currentUser) {
      notification.error({ message: "No user logged in" });
      return;
    }

    // Attempt to re-authenticate with current user's email and provided password
    await signInWithEmailAndPassword(auth, currentUser.email, adminPassword);

    if (pendingChanges) {
      // Prepare batch update for Firestore
      const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
      const updateData = {};
      const auditTrails = [];

      // Process individual cell updates
      pendingChanges.selectedCells.forEach(cellKey => {
        const [name, month] = cellKey.split('-');
        
        // Directly use the updated data from the current state
        const currentUserData = data[name];
        const currentMonthData = currentUserData[month];

        // Ensure we're using the correct paid status and amount
        const newPaidStatus = currentMonthData?.paid || false;
        const updatedAmount = month === "Hoa" 
          ? (newPaidStatus ? hoaMembershipAmount : 0)
          : (newPaidStatus ? (amounts[month] || 0) : 0);

        // Prepare Firestore update
        updateData[`Name.${name}.${month}.paid`] = newPaidStatus;
        updateData[`Name.${name}.${month}.amount`] = updatedAmount;

        // Prepare audit trail
        auditTrails.push({
          adminName: currentAdminName,
          userName: name,
          month: month,
          status: newPaidStatus ? "Paid" : "Unpaid",
          timestamp: new Date(),
          formattedTimestamp: new Date().toLocaleString(),
          year: selectedYear || new Date().getFullYear()
        });
      });

      // Update Firestore with the complete data
      await updateDoc(yearDocRef, {
        Name: data  // This will replace the entire Name field with the current state
      });

      // Batch add audit trails
      const batchAuditTrails = auditTrails.map(trail => 
        addDoc(collection(db, "auditTrails"), trail)
      );
      await Promise.all(batchAuditTrails);

      // Save monthly amounts if changed
      await saveMonthlyAmounts();

      // Close modals and reset states
      setIsPasswordModalVisible(false);
      setIsEditMode(false);
      setAdminPassword("");
      setPendingChanges(null);
      setSelectedCells([]); // Clear selected cells

      notification.success({ 
        message: "Changes saved successfully",
        description: `${pendingChanges.selectedCells.length} entries updated`
      });
    }
  } catch (error) {
    // Handle authentication errors
    setPasswordError("Incorrect password. Please try again.");
    console.error("Password verification failed:", error);
    notification.error({
      message: "Authentication Failed",
      description: "Please check your password and try again."
    });
  }
};

const handleCancelChanges = async () => {
  try {
    // If we have stored original data, use that to revert changes
    if (originalData) {
      // Restore all data from the original state
      setDataState(originalData.originalData);
      setAmounts(originalData.originalAmounts);
      setHoaMembershipAmount(originalData.originalHoaMembershipAmount);
      setSelectedCells(originalData.originalSelectedCells || []);

      // Update Firestore with the original data
      if (selectedYear) {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        await updateDoc(yearDocRef, {
          Name: originalData.originalData,
          monthlyAmounts: originalData.originalAmounts,
          hoaMembershipAmount: originalData.originalHoaMembershipAmount
        });
      }
    } else {
      // Fallback to fetching from Firestore if no original data is stored
      if (selectedYear) {
        const yearDocRef = doc(db, "balanceSheetRecord", selectedYear);
        const docSnapshot = await getDoc(yearDocRef);

        if (docSnapshot.exists()) {
          const yearData = docSnapshot.data();
          
          // Reset the data state to the Firestore data
          setDataState(yearData.Name || {});

          // Reset amounts and HOA membership to Firestore values
          const orderedMonthlyAmounts = monthsOrder.reduce((acc, month) => {
            acc[month] = yearData.monthlyAmounts?.[month] || 0;
            return acc;
          }, {});
          
          setAmounts(orderedMonthlyAmounts);
          setHoaMembershipAmount(yearData.hoaMembershipAmount || 0);
        }
      }
    }

    // Reset other states
    setIsPasswordModalVisible(false);
    setIsEditMode(false);
    setAdminPassword("");
    setPendingChanges(null);
    setPasswordError("");
    setSelectedCells([]); // Clear selected cells

    notification.info({ 
      message: "Changes cancelled", 
      description: "Reverted to the last saved state" 
    });
  } catch (error) {
    console.error("Error cancelling changes:", error);
    notification.error({ 
      message: "Error cancelling changes", 
      description: "Unable to revert changes" 
    });
  }
};

 // Modify the existing edit button to use new save method
 const toggleEditMode = () => {
  if (isEditMode) {
    // When trying to save, open password verification
    saveChangesWithVerification();
  } else {
    // Simply toggle edit mode if not saving
    setIsEditMode(true);
  }
};


  return (
    <>
      <section className="bg-white rounded-lg w-full shadow-md border-2 p-4 space-y-6 mx-auto">
      <Button
  type="default"
  className="text-sm transition-transform transform hover:scale-105"
  onClick={handleOpenGuideModal}
>
  <QuestionCircleOutlined /> Guide
</Button>
  <div className="space-y-6">
    {/* Header Section */}
    <div className="flex justify-between items-center border-b pb-4">
      <h1 className="text-xl font-bold">
        Butaw Collection and HOA Membership {selectedYear}
      </h1>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        />
        <Button
  type="primary"
  className="bg-[#0C82B4] text-white rounded text-sm transition-transform transform hover:scale-105"
  onClick={handleOpenAdjustModal}
>
  {isEditMode ? "Adjust Amount" : "View Amount"}
</Button>

<Button
        type="primary"
        className="bg-[#0C82B4] text-white rounded text-sm transition-transform transform hover:scale-105"
        onClick={toggleEditMode}
      >
        {isEditMode ? "Save" : "Edit"}
      </Button>
      {isEditMode && (
      <Button key="cancel" onClick={handleCancelChanges}>
            Cancel Changes
          </Button>
         )}
        {isEditMode && (
          <Button
            type="primary"
            className="bg-green-500 text-white rounded text-sm transition-transform transform hover:scale-105"
            onClick={handleOpenModal}
          >
            Add New User
          </Button>
          
        )}
        


          <Button
            type="primary"
            icon={<FaClipboardList />}
            className="bg-purple-500 text-white rounded text-sm transition-transform transform hover:scale-105"
            onClick={handleOpenAuditModal}
          >
            Audit Trail
          </Button>
        
      </div>
    </div>

     {/* Adjust Monthly Amounts Section */}
     {isAdjustModalOpen && (
        <Modal
          
          isOpen={isAdjustModalOpen}
          onClose={handleCloseAdjustModal}
        >
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold">Adjust Monthly Amounts</h2>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {Object.keys(amounts).map((month) => (
                <div key={month} className="flex flex-col">
                  <label className="font-semibold">{month}</label>
                  <input
                    type="number"
                    step="any"
                    value={amounts[month] === 0 ? "" : amounts[month]}
                    onChange={(e) => handleAmountChange(month, e.target.value)}
                    className="border px-3 py-2 rounded text-sm"
                    disabled={!isEditMode}
                  />
                </div>
              ))}
              <div className="flex flex-col">
                <label className="font-semibold">HOA Membership</label>
                <input
                  type="number"
                  step="any"
                  value={hoaMembershipAmount === 0 ? "" : hoaMembershipAmount}
                  onChange={(e) => handleHoaMembershipChange(e.target.value)}
                  className="border px-3 py-2 rounded text-sm"
                  disabled={!isEditMode}
                />
              </div>
            </div>
            <Button
              type="primary"
              className="mt-4 bg-blue-500 text-white rounded text-sm transition-transform transform hover:scale-105"
              onClick={saveMonthlyAmounts}
              disabled={!isButtonActive || !isEditMode}
            >
              Save Monthly Amounts
            </Button>
          </div>
        </Modal>
      )}


    {/* Balance Sheet Table Section */}
    <div id="balance-sheet-section" className="overflow-x-auto">
    {/* Enhanced Totals Display Section */}
    <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Total Butaw Collection */}
              <div className="flex items-center bg-blue-100 p-4 rounded-lg shadow-sm">
              <FaMoneyBillWave className="text-2xl text-blue-600 mr-3" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-gray-600">Total Butaw Collection</p>
                    <p className="text-lg font-bold text-blue-700">₱{totalMonthPaid.toLocaleString()} </p>
                  </div>
                </div>
              </div>

              {/* Total HOA Membership */}
              <div className="flex items-center bg-green-100 p-4 rounded-lg shadow-sm">
                <TeamOutlined className="text-2xl text-green-600 mr-3" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-gray-600">Total HOA Membership Paid</p>
                    <p className="text-lg font-bold text-green-700">₱{totalHoaMembershipPaid.toLocaleString()} </p>
                  </div>
                </div>
              </div>
            </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            {months.map((month) => (
              <th key={month} className="border px-2 py-1">
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
  {filteredData
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, status]) => (
      <tr key={name}>
        <td className="border px-2 py-1 whitespace-nowrap overflow-hidden">
          {name}
        </td>
        {months.map((month) => (
          <td
          key={month}
          className={`border px-2 py-1 text-center cursor-pointer 
            ${status[month]?.paid ? "bg-green-200" : "bg-red-200"}
            ${isEditMode && selectedCells.includes(`${name}-${month}`) 
              ? 'ring-2 ring-blue-500 bg-blue-300' 
              : ''}
            hover:bg-opacity-70 transition-all`}
          onClick={() => isEditMode && togglePaidStatus(name, month)}
          title={isEditMode ? "Click to select/deselect for bulk update" : ""}
        >
          {status[month]?.paid ? "Paid" : "Unpaid"}
        </td>
        ))}
       
      </tr>
    ))}
</tbody>
      </table>
    </div>
  </div>

  {/* Add New User Modal */}
  {isModalOpen && (
  <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
  <div className="bg-white p-4 max-w-md max-h-[80vh] overflow-y-auto">
    <h2 className="text-xl font-bold mb-4">Add New Users</h2>
    
    <Transfer
      dataSource={userSuggestions}
      targetKeys={targetKeys}
      onChange={handleTransferChange}
      render={(item) => item.title}
      titles={['Available Users', 'Selected Users']}
      oneWay
      className="mb-4"
    />

    <div className="mt-4 flex justify-end space-x-2">
      <Button onClick={handleCloseModal}>Cancel</Button>
      <Button 
        type="primary" 
        onClick={handleAddUser} 
        disabled={targetKeys.length === 0}
      >
        Add Users
      </Button>
    </div>
  </div>
</Modal>
  )}
 <AntModal
  title="Audit Trail"
  open={isAuditModalOpen}
  onCancel={() => setIsAuditModalOpen(false)}
  footer={[
    <Button 
      key="print" 
      icon={<PrinterOutlined />} 
      onClick={handlePrintAuditTrail}
      disabled={auditTrails.length === 0}
    >
      Print Audit Trail
    </Button>
  ]}
  width={600}
>
        <div className="max-h-[500px] overflow-y-auto">
          {auditTrails.length === 0 ? (
            <p className="text-center text-gray-500">No audit trails found</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Admin</th>
                  <th className="border p-2">User</th>
                  <th className="border p-2">Month</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditTrails.map((trail) => (
                  <tr key={trail.id} className="hover:bg-gray-50">
                    <td className="border p-2">{trail.adminName}</td>
                    <td className="border p-2">{trail.userName}</td>
                    <td className="border p-2">{trail.month}</td>
                    <td className={`border p-2 ${trail.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {trail.status}
                    </td>
                    <td className="border p-2">{trail.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AntModal>
      <AntModal
  title="Balance Sheet Tool Guide"
  open={isGuideModalOpen}
  onCancel={() => setIsGuideModalOpen(false)}
  footer={null}
  width={600}
>
<div className="max-h-[500px] overflow-y-auto p-4 bg-gray-50">
<Typography className="px-4">
      {/* Overview Section */}
      <Title level={2}>
        <DashboardOutlined className="mr-2" />
        Overview
      </Title>
      <Paragraph>
        This comprehensive tool is designed to help your organization efficiently manage monthly collections 
        and HOA membership payments with ease and transparency.
      </Paragraph>
      
      <Divider />

      {/* Main Features */}
      <Title level={2}>
        <ToolOutlined className="mr-2" />
        Main Features
      </Title>

      <Card title="1. Dashboard View" className="mb-4">
        <Title level={4}>Payment Status Table</Title>
        <List
          size="small"
          bordered
          dataSource={[
            'Each row represents a member',
            'Columns represent months and HOA membership',
            'Color-coded cells indicate payment status'
          ]}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
        <Space className="mt-4">
          <Tag color="success">🟢 Green: Paid</Tag>
          <Tag color="error">🔴 Red: Unpaid</Tag>
        </Space>
      </Card>

      <Card title="2. Total Collections Summary" className="mb-4">
        <List
          size="small"
          bordered
          dataSource={[
            {
              title: 'Total Butaw Collection',
              description: 'Sum of all monthly payments'
            },
            {
              title: 'Total HOA Membership Paid',
              description: 'Sum of HOA membership fees'
            }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card 
        title={
          <Space>
            <SearchOutlined />
            3. Search Functionality
          </Space>
        } 
        className="mb-4"
      >
        <List
          size="small"
          bordered
          dataSource={[
            'Quick member lookup',
            'Type a name in the search bar',
            'Instantly filters the table',
            'Helps manage large member lists efficiently'
          ]}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Card>

      <Divider />

      {/* Editing Modes */}
      <Title level={2}>
        <EditOutlined className="mr-2" />
        Editing Modes
      </Title>

      <Steps
        direction="vertical"
        size="small"
        items={[
          {
            title: 'Edit Mode Activation',
            description: 'Click "Edit" button to enter edit mode. Additional options become available.'
          },
          {
            title: 'Payment Status Management',
            description: (
              <List
                size="small"
                dataSource={[
                  'Toggle payment status (Paid/Unpaid)',
                  'Select multiple cells for bulk updates',
                  'Visually track payment history'
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            )
          },
          {
            title: 'Adding New Users',
            icon: <UserAddOutlined />,
            description: (
              <List
                size="small"
                dataSource={[
                  'Click "Add New User" in edit mode',
                  'Transfer users from available list',
                  'Select multiple users simultaneously',
                  'Automatically initializes their payment records'
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            )
          },
          {
            title: 'Amount Adjustment',
            icon: <DollarOutlined />,
            description: (
              <List
                size="small"
                dataSource={[
                  'Click "Adjust Amount"',
                  'Modify monthly collection rates',
                  'Update HOA membership fees',
                  'Save changes with "Save Monthly Amounts" button'
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            )
          }
        ]}
      />

      <Divider />

      {/* Audit Trail */}
      <Title level={2}>
        <AuditOutlined className="mr-2" />
        Audit Trail Features
      </Title>

      <Card className="mb-4">
        <List
          size="small"
          bordered
          dataSource={[
            'Administrator name',
            'User affected',
            'Month of change',
            'Payment status',
            'Exact timestamp'
          ]}
          header={<div className="font-semibold">Records include:</div>}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Card>

      {/* Advanced Features */}
      <Card 
        title={
          <Space>
            <ToolOutlined />
            Advanced Functionality
          </Space>
        }
        className="mb-4"
      >
        <List
          size="small"
          bordered
          dataSource={[
            {
              title: 'Bulk Update',
              description: [
                'Select multiple payment cells',
                'Mark all selected entries as paid',
                'Speeds up mass payment recording'
              ]
            },
            {
              title: 'Year Selection',
              description: [
                'Manage financial records for different years',
                'Seamless year-to-year tracking'
              ]
            }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={
                  <ul className="pl-4">
                    {item.description.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Important Guidelines */}
      <Alert
        message="Important Guidelines"
        description={
          <List
            size="small"
            dataSource={[
              'Always verify changes before saving',
              'Use search function for quick navigation',
              'Regularly review audit trails',
              'Maintain consistent data entry'
            ]}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
        }
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        className="mb-4"
      />

      {/* Troubleshooting */}
      <Card 
        title="Troubleshooting Tips" 
        className="mb-4"
        type="inner"
      >
        <List
          size="small"
          bordered
          dataSource={[
            'Ensure correct year is selected',
            'Check internet connection',
            'Refresh page if updates fail',
            'Verify admin login status'
          ]}
          header={<Text strong>Common Issues:</Text>}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Card>
    </Typography>
   
  </div>
</AntModal>
<AntModal
        title="Verify Changes"
        open={isPasswordModalVisible}
        onCancel={handleCancelChanges}
        footer={[
          <Button 
            key="verify" 
            type="primary" 
            onClick={handlePasswordVerification}
          >
            Verify and Save
          </Button>
        ]}
      >
        <div className="space-y-4">
          <p>Please enter your admin password to confirm these changes:</p>
          <Input.Password
            placeholder="Enter your password"
            value={adminPassword}
            onChange={(e) => {
              setAdminPassword(e.target.value);
              setPasswordError(""); // Clear any previous error
            }}
          />
          {passwordError && (
            <div className="text-red-500">{passwordError}</div>
          )}
        </div>
      </AntModal>
</section>
    </>
  );
};

export default BalanceSheetSection;
