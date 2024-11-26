import React, { useState, useEffect } from "react";
import {collection,onSnapshot,doc,deleteDoc,getDoc,setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../components/admin/Modal";
import { db } from "../firebases/FirebaseConfig";
import closeIcon from "../assets/icons/close-icon.svg";
import { ClipLoader } from "react-spinners"; // Import the spinner
import { FaPlus, FaPrint, FaTrash } from "react-icons/fa";
import { Dropdown, Button, Menu, Modal as AntModal, Input } from "antd";
import { DownOutlined, ContainerFilled } from "@ant-design/icons"; // Import Ant Design icons
import spacetime from "spacetime";


const CashflowRecord = ({ cashFlow, setCashFlow }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableCashFlow, setEditableCashFlow] = useState(cashFlow);
  const [selectedCashFlow, setSelectedCashFlow] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.error("User is not authenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().isAdmin);
        } else {
          console.error("No such user document!");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAdmin(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isAdmin === null || !cashFlow) {
    return <div>Loading...</div>;
  }

  const handleDateChange = (event) => {
    const date = new Date(event.target.value);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCashFlow((prevCashFlow) => ({
      ...prevCashFlow,
      date: formattedDate,
    }));

    // Update the existing dates list if the new date doesn't already exist
    if (!existingDates.includes(formattedDate)) {
      setExistingDates((prevDates) => [...prevDates, formattedDate]);
    }
  };

  const formatAmount = (amount) =>
    `₱${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;


  const handleEdit = (cashFlow) => {
    setSelectedCashFlow(cashFlow); // Select the cashFlow to be edited
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCashFlow(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Start loading

    const totalOpeningBalance = calculateTotal("openingBalance");
    const totalCashReceipts = calculateTotal("cashReceipts");
    const totalPledges = calculateTotal("pledges");
    const totalCashPaidOut = calculateTotal("cashPaidOut");

    const totalCashAvailable = (
      parseFloat(totalOpeningBalance) + parseFloat(totalCashReceipts) + parseFloat(totalPledges)
    ).toFixed(2);

    const endingBalance = (
      parseFloat(totalCashAvailable) - parseFloat(totalCashPaidOut)
    ).toFixed(2);

    const updatedCashFlow = {
      ...selectedCashFlow,
      totalCashAvailable: {
        description: "Total Cash Available",
        amount: totalCashAvailable,
      },
      totalCashPaidOut: {
        description: "Total Cash Paid-out",
        amount: totalCashPaidOut,
      },
      endingBalance: {
        description: "Ending Balance",
        amount: endingBalance,
      },
    };

    try {
      const docRef = doc(db, "cashFlowRecords", selectedCashFlow.date);
      await setDoc(docRef, updatedCashFlow);
      setCashFlow(updatedCashFlow); // Update the main cashFlow state
      setSelectedCashFlow(updatedCashFlow); // Keep modal in sync
      toast.success("Record updated successfully! Reload Page");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      toast.error("Failed to update the record.");
    }

    setIsLoading(false); // Stop loading
    handleCloseModal();
  };

  const handleInputChange = (field, index, key, value) => {
    const updatedField = [...selectedCashFlow[field]];
    updatedField[index][key] = value;
    setSelectedCashFlow({ ...selectedCashFlow, [field]: updatedField });
  };

  const renderInputs = (type) => {
    if (!cashFlow || !cashFlow[type]) {
      return null;
    }
    return cashFlow[type].map((item, index) => (
      <div key={index} className="flex items-center space-x-2 mb-2">
        <Input
          placeholder="Description"
          value={item.description}
          onChange={(e) =>
            handleChange(type, index, "description", e.target.value)
          }
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
        <Input
          placeholder="Amount"
          type="number"
          value={item.amount}
          onChange={(e) => handleChange(type, index, "amount", e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
        {index >= 1 && ( // Show trash icon only for items added after the first one
          <button
            type="button"
            className="text-red-500 ml-2"
            onClick={() => handleRemoveInput(type, index)}
          >
            <FaTrash />
          </button>
        )}
      </div>
    ));
  };

  const calculateTotal = (section) => {
    return selectedCashFlow[section]
      .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  // for Edit modal
  const handleAddInput = (section) => {
    const updatedCashFlow = {
      ...cashFlow,
      [section]: [...cashFlow[section], { description: "", amount: "" }],
    };
    setCashFlow(updatedCashFlow);
    setSelectedCashFlow(updatedCashFlow); // Make sure the modal is updated too
  };

  // for Edit modal
  const handleRemoveInput = (section) => {
    const updatedCashFlow = {
      ...cashFlow,
      [section]: cashFlow[section].slice(0, -1),
    };
    setCashFlow(updatedCashFlow);
    setSelectedCashFlow(updatedCashFlow); // Make sure the modal is updated too
  };

  const handleChange = (type, index, field, value) => {
    const updatedItems = [...cashFlow[type]];
    updatedItems[index][field] = value;
    setCashFlow((prev) => ({ ...prev, [type]: updatedItems }));
  };

  return (
    <div className="p-2 bg-[#E9F5FE] rounded-lg desktop:w-[63rem] laptop:w-[53rem] tablet:w-[38rem] mx-auto border-2 shadow-xl">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="font-semibold my-auto desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs">
        Report Generation Date: <br />
          {cashFlow.date}
        </h2>
      </div>

      {/* Your table rendering code */}
      {/* Opening Balance */}
      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">
          Opening Balance
        </h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 text-left p-1">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.openingBalance.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add: Cash Receipts */}
      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">
          Butaw
        </h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.cashReceipts.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pledges */}
      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Pledges</h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.pledges.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
            <tr className="bg-[#0C82B4] text-white font-bold">
              <td className="border border-gray-300 p-1">
                {cashFlow.totalCashAvailable.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(cashFlow.totalCashAvailable.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Less: Cash Paid-out */}
      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">
          Less: Cash Paid-out
        </h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">
                Description
              </th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.cashPaidOut.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  {item.description}
                </td>
                <td className="border border-gray-300 p-1 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
            <tr className="bg-[#0C82B4] text-white font-bold">
              <td className="border border-gray-300 p-1">
                {cashFlow.totalCashPaidOut.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(cashFlow.totalCashPaidOut.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Ending Balance */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-[#F1F2BF] font-bold">
              <td className="border border-gray-300 p-1">
                {cashFlow.endingBalance.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(cashFlow.endingBalance.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      
    </div>
  );
};

export default CashflowRecord;
