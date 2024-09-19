import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../components/admin/Modal";
import { db } from "../firebases/FirebaseConfig";
import closeIcon from "../assets/icons/close-icon.svg";
import { Dropdown, Button, Menu, Modal as AntModal, Input } from "antd";
import { DownOutlined, ContainerFilled } from '@ant-design/icons'; // Import Ant Design icons
import { FaPlus, FaPrint, FaTrash } from "react-icons/fa";

const IncomeStateRecord = ({ incomeStatement, setIncomeStatement }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableIncomeState, setEditableIncomeState] = useState(incomeStatement);
  const [selectedIncomeState, setSelectedIncomeState] = useState(null);
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

  if (isAdmin === null || !incomeStatement) {
    return <div>Loading...</div>;
  }

  const formatAmount = (amount) =>
    `₱${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleDelete = async (date) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmDelete) {
      try {
        const docRef = doc(db, "incomeStatementRecords", date);
        await deleteDoc(docRef);
        toast.success("Record deleted successfully! Please Reload Page");
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete the record.");
      }
    }
  };

  const handleEdit = (incomeStatement) => {
    setSelectedIncomeState(incomeStatement); // Select the cashFlow to be edited
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncomeState(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const totalRevenue = calculateTotal("incomeRevenue");
    const totalExpenses = calculateTotal("incomeExpenses");
    const netIncome = (
      parseFloat(totalRevenue) - parseFloat(totalExpenses)
    ).toFixed(2);


    const updatedIncomeStatement = {
      ...incomeStatement,
      totalRevenue: {
        description: "Total Revenue",
        amount: totalRevenue,
      },
      totalExpenses: {
        description: "Total Expenses",
        amount: totalExpenses,
      },
      netIncome: { description: "Net Income", amount: netIncome },
    };

    try {
      const docRef = doc(db, "incomeStatementRecords", selectedIncomeState.date);
      await setDoc(docRef, updatedIncomeStatement);
      setIncomeStatement(updatedIncomeStatement); // Update the main cashFlow state
      setSelectedIncomeState(updatedIncomeStatement); // Keep modal in sync
      toast.success("Record updated successfully! Reload Page");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      toast.error("Failed to update the record.");
    }

    handleCloseModal();
  };

  const handleInputChange = (field, index, key, value) => {
    const updatedField = [...selectedIncomeState[field]];
    updatedField[index][key] = value;
    setSelectedIncomeState({ ...selectedIncomeState, [field]: updatedField });
  };

  const renderInputs = (type) => {
    if (!incomeStatement || !incomeStatement[type]) {
      return null;
    }
    return incomeStatement[type].map((item, index) => (
      <div key={index} className="flex items-center space-x-2 mb-2">
        <Input
          placeholder="Description"
          value={item.description}
          onChange={(e) => handleInputChange(type, index, "description", e.target.value)}
          className="border border-gray-300 p-2 rounded-lg flex-1"
        />
        <Input
          placeholder="Amount"
          value={item.amount}
          onChange={(e) => handleInputChange(type, index, "amount", e.target.value)}
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
    return selectedIncomeState[section]
      .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  // for Edit modal
  const handleAddInput = (section) => {
    const updatedIncomeStatement = {
      ...incomeStatement,
      [section]: [...incomeStatement[section], { description: "", amount: "" }],
    };
    setIncomeStatement(updatedIncomeStatement);
    setSelectedIncomeState(updatedIncomeStatement); // Make sure the modal is updated too
  };

  // // for Edit modal
  const handleRemoveInput = (section) => {
    const updatedIncomeStatement = {
      ...incomeStatement,
      [section]: incomeStatement[section].slice(0, -1),
    };
    setIncomeStatement(updatedIncomeStatement);
    setSelectedIncomeState(updatedIncomeStatement); // Make sure the modal is updated too
  };


  // Check if incomeStatement exists and has the necessary properties
 if (!incomeStatement.incomeRevenue || !incomeStatement.incomeExpenses) {
    return <div>Select a Date</div>; // Or any other fallback UI while data is being fetched
  }
  


  return (
    <div className="p-2 bg-[#E9F5FE] rounded-lg desktop:w-[63rem] laptop:w-[53rem] tablet:w-[38rem] mx-auto border-2 shadow-xl">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="font-semibold">Date Created: {incomeStatement.date}</h2>
        {isAdmin && (
          <div>
            <button
              className="bg-red-500 text-white p-2 rounded mr-2"
              onClick={() => handleDelete(incomeStatement.date)}
            >
              Delete
            </button>
            <button
              className="bg-[#0C82B4] text-white p-2 rounded"
              onClick={() => handleEdit(incomeStatement)}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Your table rendering code */}

      {/* Revenue */}
      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Revenue</h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">Description</th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {incomeStatement.incomeRevenue.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.description}</td>
                <td className="border border-gray-300 p-1 text-right">{formatAmount(item.amount)}</td>
              </tr>
            ))}
            <tr className="bg-[#0C82B4] text-white font-bold">
              <td className="border border-gray-300 p-1">
                {incomeStatement.totalRevenue?.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(incomeStatement.totalRevenue?.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Expenses */}
      <div className="mb-6">
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Expenses</h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">Description</th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {incomeStatement.incomeExpenses.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.description}</td>
                <td className="border border-gray-300 p-1 text-right">{formatAmount(item.amount)}</td>
              </tr>
            ))}
            <tr className="bg-[#0C82B4] text-white font-bold">
              <td className="border border-gray-300 p-1">
                {incomeStatement.totalExpenses?.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(incomeStatement.totalExpenses?.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net income */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-[#F1F2BF] font-bold">
              <td className="border border-gray-300 p-1">
                {incomeStatement.netIncome?.description}
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {formatAmount(incomeStatement.netIncome?.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AntModal
        title="Edit Income Statement"
        visible={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
      >
        <form>
          <div className="mb-4">
          <h2 className="font-semibold">Date: {incomeStatement.date}</h2>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Revenue</h2>
            {renderInputs("incomeRevenue")}
            <button
              type="button"
              className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
              onClick={() => handleAddInput("incomeRevenue")}
            >
              <FaPlus className="mr-2" /> Add Revenue
            </button>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Expenses</h2>
            {renderInputs("incomeExpenses")}
            <button
              type="button"
              className="bg-green-400 text-white mt-2 rounded-md flex justify-center items-center p-2"
              onClick={() => handleAddInput("incomeExpenses")}
            >
              <FaPlus className="mr-2" /> Add Expense
            </button>
          </div>
        </form>
      </AntModal>
    </div>
  );
};

export default IncomeStateRecord;
