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
import { ClipLoader } from "react-spinners"; // Import the spinner

const CashflowRecord = ({ cashFlow, setCashFlow }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableCashFlow, setEditableCashFlow] = useState(cashFlow);
  const [selectedCashFlow, setSelectedCashFlow] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

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
        const docRef = doc(db, "cashFlowRecords", date);
        await deleteDoc(docRef);
        toast.success("Record deleted successfully! Please Reload Page");
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete the record.");
      }
    }
  };

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
    const totalCashPaidOut = calculateTotal("cashPaidOut");

    const totalCashAvailable = (
      parseFloat(totalOpeningBalance) + parseFloat(totalCashReceipts)
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

  const renderInputs = (field) => {
    return selectedCashFlow[field].map((item, index) => (
      <div key={index} className="flex space-x-2">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded-lg flex-1"
          value={item.description}
          onChange={(e) =>
            handleInputChange(field, index, "description", e.target.value)
          }
        />
        <input
          type="number"
          className="border border-gray-300 p-2 rounded-lg flex-1"
          value={item.amount}
          onChange={(e) =>
            handleInputChange(field, index, "amount", e.target.value)
          }
        />
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

  return (
    <div className="p-2 bg-[#E9F5FE] rounded-lg desktop:w-[63rem] laptop:w-[53rem] tablet:w-[38rem] mx-auto border-2 shadow-xl">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="font-semibold">Date: {cashFlow.date}</h2>
        {isAdmin && (
          <div>
            <button
              className="bg-red-500 text-white p-2 rounded mr-2"
              onClick={() => handleDelete(cashFlow.date)}
            >
              Delete
            </button>
            <button
              className="bg-[#0C82B4] text-white p-2 rounded"
              onClick={() => handleEdit(cashFlow)}
            >
              Edit
            </button>
          </div>
        )}
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
          Add: Cash Receipts
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
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto mt-5">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <ClipLoader color="#0C82B4" loading={isLoading} size={50} />
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold mb-4">
                    Add New Cash Flow Record
                  </h2>
                  <button
                    className="absolute top-2 right-2 text-right"
                    onClick={handleCloseModal}
                  >
                    <img src={closeIcon} alt="Close Icon" className="h-5 w-5" />
                  </button>
                </div>
                <h2 className="font-semibold">Date: {cashFlow.date}</h2>
                <div className="border border-gray-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Opening Balance</h3>
                  {renderInputs("openingBalance")}
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="button"
                      className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                      onClick={() => handleAddInput("openingBalance")}
                    >
                      Add New
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleRemoveInput("openingBalance")}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="border border-gray-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Add: Cash Receipts</h3>
                  {renderInputs("cashReceipts")}
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="button"
                      className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                      onClick={() => handleAddInput("cashReceipts")}
                    >
                      Add New
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleRemoveInput("cashReceipts")}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="border border-gray-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Less: Cash Paid-out</h3>
                  {renderInputs("cashPaidOut")}
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="button"
                      className="bg-[#0C82B4] text-white px-3 py-1 rounded"
                      onClick={() => handleAddInput("cashPaidOut")}
                    >
                      Add New
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleRemoveInput("cashPaidOut")}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Compute
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CashflowRecord;
