import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from "../firebases/FirebaseConfig"; // Adjust the path to your firebase.js file

const CashflowRecord = ({ cashFlow }) => {
  const [isAdmin, setIsAdmin] = useState(null); // Start with `null` to indicate loading state
  const [userId, setUserId] = useState(null);

  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.error("User is not authenticated");
        // Handle unauthenticated state, e.g., redirect to login page
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Fetch user data to determine if they are admin
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
          setIsAdmin(false); // Default to non-admin if the user document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAdmin(false); // Default to non-admin if there's an error
      }
    };

    fetchUserData();
  }, [userId]);

  // Debugging logs
  console.log("isAdmin:", isAdmin);
  console.log("userId:", userId);
  console.log("cashFlow:", cashFlow);

  // Handle loading states
  if (isAdmin === null || !cashFlow) {
    return <div>Loading...</div>;
  }

  const formatAmount = (amount) => `₱${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleDelete = async (date) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
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
              onClick={() => alert("Edit functionality to be implemented")}
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
              <th className="border border-gray-300 text-left p-1">Description</th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.openingBalance.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.description}</td>
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
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Add: Cash Receipts</h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">Description</th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.cashReceipts.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.description}</td>
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
        <h2 className="bg-blue-100 p-2 rounded-t-lg font-bold">Less: Cash Paid-out</h2>
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#E7E7E7]">
            <tr>
              <th className="border border-gray-300 p-1 text-left">Description</th>
              <th className="border border-gray-300 p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlow.cashPaidOut.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.description}</td>
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
