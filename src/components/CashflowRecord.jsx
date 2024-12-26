import React, { useState, useEffect } from "react";
import {collection,onSnapshot,doc,deleteDoc,getDoc,setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../firebases/FirebaseConfig";

const CashflowRecord = ({ cashFlow, setCashFlow }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [userId, setUserId] = useState(null);


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

  return (
    <div className="p-2 bg-[#E9F5FE] rounded-lg w-auto mx-4 border-2 shadow-xl">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="font-semibold my-auto desktop:text-lg laptop:text-lg tablet:text-base phone:text-xs">
        Report Generation Date: <br />
          {cashFlow.date}
        </h2>
      </div>

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
